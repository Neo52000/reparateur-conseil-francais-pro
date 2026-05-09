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

let initialized = false;

function initSentryOnce(): boolean {
  if (initialized) return true;

  const dsn = Deno.env.get("SENTRY_DSN");
  if (!dsn) {
    // Operator hasn't configured Sentry — silently skip.
    initialized = true;
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

type Handler = (req: Request) => Promise<Response> | Response;

/**
 * Wrap a Deno serve handler so any uncaught throw is captured to Sentry
 * with `function_name` + `request_id` tags before being rethrown.
 *
 * The wrapper intentionally rethrows: each edge function already has its
 * own error handling that returns a JSON 500. We just want the trace in
 * Sentry on top of that.
 */
export function withSentry(functionName: string, handler: Handler): Handler {
  return async (req: Request) => {
    initSentryOnce();
    const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID().slice(0, 8);

    try {
      return await handler(req);
    } catch (err) {
      captureEdgeError(err, { functionName, requestId });
      // Best-effort flush before the Edge Function worker is recycled.
      try {
        await Sentry.flush(2000);
      } catch {
        // ignore
      }
      throw err;
    }
  };
}
