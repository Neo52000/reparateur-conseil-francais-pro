/**
 * Sentry instrumentation for Supabase Edge Functions (Deno).
 *
 * Why this exists: the React app (`src/config/sentry.ts`) is already
 * instrumented, but Edge Functions ran completely blind in production —
 * Stripe webhook signature failures, scraping crashes, AI rate-limit
 * errors all surfaced as 500s in dashboard logs without stack traces or
 * context. Refs AUDIT_20260507 § 3 P2 #14.
 *
 * Setup (operator-side):
 *   supabase secrets set SENTRY_DSN=<your-deno-project-DSN>
 *
 * Use in a function:
 *   import { withSentry, captureEdgeError } from "../_shared/sentry.ts";
 *
 *   serve(withSentry("function-name", async (req) => {
 *     // …handler body
 *   }));
 *
 * The `withSentry` wrapper:
 *   - lazily inits Sentry on first request (per worker)
 *   - tags every event with `function_name` + a short request id
 *   - captures uncaught exceptions and lets them rebubble (so the
 *     existing error response logic still runs)
 *   - flushes before the response leaves to ensure delivery
 *
 * If `SENTRY_DSN` is missing, this is a no-op — handlers run as before.
 */

// Deno-compatible Sentry build via esm.sh.
// `@sentry/deno` exposes the same surface as `@sentry/node`.
import * as Sentry from "https://esm.sh/@sentry/deno@8.55.0";

// `null` = not yet checked; `false` = checked, no DSN; `true` = initialized.
// Tri-state because using `boolean` collapses "no DSN" and "ready" into the
// same value on subsequent calls.
let initialized: boolean | null = null;

function initSentryOnce(): boolean {
  if (initialized !== null) return initialized;

  const dsn = Deno.env.get("SENTRY_DSN");
  if (!dsn) {
    // Operator hasn't configured Sentry — silently skip.
    initialized = false;
    return false;
  }

  Sentry.init({
    dsn,
    environment: Deno.env.get("DENO_DEPLOYMENT_ID") ? "production" : "development",
    // Edge Functions are short-lived; sample modestly.
    tracesSampleRate: 0.1,
    // Filter out the metier errors we already handle ourselves so the
    // Sentry quota isn't drained by 401/403/429 normality.
    beforeSend(event) {
      const code = event.tags?.error_code;
      if (code === "missing_auth" || code === "invalid_token" || code === "forbidden" || code === "rate_limited") {
        return null;
      }
      return event;
    },
  });

  initialized = true;
  return true;
}

interface CaptureContext {
  functionName: string;
  requestId?: string;
  errorCode?: string;
  extra?: Record<string, unknown>;
}

/**
 * Capture an error explicitly with edge-function context. Safe to call
 * even when Sentry isn't configured (becomes a no-op).
 */
export function captureEdgeError(err: unknown, ctx: CaptureContext): void {
  if (!initSentryOnce()) return;

  Sentry.withScope((scope) => {
    scope.setTag("function_name", ctx.functionName);
    if (ctx.requestId) scope.setTag("request_id", ctx.requestId);
    if (ctx.errorCode) scope.setTag("error_code", ctx.errorCode);
    if (ctx.extra) scope.setContext("extra", ctx.extra);
    Sentry.captureException(err);
  });
}

// `Deno.serve` and the Supabase Edge runtime may pass extra positional
// args (e.g. `ConnInfo` for the client IP, or `context.waitUntil`).
// Forward whatever's passed verbatim so wrapping stays transparent.
type Handler = (req: Request, ...args: unknown[]) => Promise<Response> | Response;

/**
 * Wrap a Deno serve handler so:
 *   - any uncaught throw is captured to Sentry with `function_name` +
 *     `request_id` tags (and rethrown — the edge function's own catch
 *     still owns the 500 response).
 *   - any manual `captureEdgeError(err, …)` calls inside the handler
 *     are flushed before the response leaves, even on the success path.
 *
 * Without the success-path flush, manually captured handled-error events
 * (e.g. on a 400 response) get dropped when the isolate is suspended
 * before the async send completes.
 */
export function withSentry(functionName: string, handler: Handler): Handler {
  return async (req: Request, ...args: unknown[]) => {
    const isEnabled = initSentryOnce();
    const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID().slice(0, 8);

    try {
      return await handler(req, ...args);
    } catch (err) {
      if (isEnabled) {
        captureEdgeError(err, { functionName, requestId });
      }
      throw err;
    } finally {
      if (isEnabled) {
        // Best-effort flush — runs on both success and error paths so
        // explicit `captureEdgeError` calls inside the handler aren't
        // lost when the isolate is recycled.
        await Sentry.flush(2000).catch(() => {});
      }
    }
  };
}
