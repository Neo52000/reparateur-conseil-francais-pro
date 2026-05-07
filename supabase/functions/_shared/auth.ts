/**
 * Shared auth helpers for Supabase Edge Functions.
 *
 * - `requireAdmin(req)` validates a Supabase JWT and checks `has_role(_, 'admin')`.
 * - `requireCronSecret(req)` validates the `x-cron-secret` header against the
 *   `CRON_SECRET` env var — used by scheduled jobs that don't have a user.
 *
 * Both return either `{ ok: true, ... }` or `{ ok: false, response }` so the
 * caller can `return result.response` immediately.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders } from "./cors.ts";

type AuthOk<T> = { ok: true } & T;
type AuthFail = { ok: false; response: Response };

function jsonError(req: Request, status: number, error: string, message: string): Response {
  return new Response(
    JSON.stringify({ success: false, error, message }),
    {
      status,
      headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" },
    }
  );
}

function decodeJwtSub(authHeader: string): string | null {
  if (!authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload?.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

/**
 * Require the caller to be an authenticated admin.
 * Uses the server-side `has_role` RPC — never trusts JWT metadata.
 */
export async function requireAdmin(
  req: Request,
): Promise<AuthOk<{ userId: string }> | AuthFail> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return { ok: false, response: jsonError(req, 401, "missing_auth", "Authorization header required") };
  }

  const userId = decodeJwtSub(authHeader);
  if (!userId) {
    return { ok: false, response: jsonError(req, 401, "invalid_token", "Bearer token is invalid") };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return { ok: false, response: jsonError(req, 500, "server_misconfigured", "Supabase env vars missing") };
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });

  if (error) {
    console.error("requireAdmin: has_role RPC error", error);
    return { ok: false, response: jsonError(req, 500, "auth_check_failed", "Could not verify admin role") };
  }

  if (!data) {
    return { ok: false, response: jsonError(req, 403, "forbidden", "Admin role required") };
  }

  return { ok: true, userId };
}

/**
 * Require a shared secret in the `x-cron-secret` header (compared with the
 * `CRON_SECRET` env var). Used by scheduled jobs.
 */
export function requireCronSecret(req: Request): AuthOk<Record<string, never>> | AuthFail {
  const expected = Deno.env.get("CRON_SECRET");
  if (!expected) {
    return { ok: false, response: jsonError(req, 500, "server_misconfigured", "CRON_SECRET not configured") };
  }
  const provided = req.headers.get("x-cron-secret");
  if (!provided || provided !== expected) {
    return { ok: false, response: jsonError(req, 401, "missing_or_invalid_secret", "Invalid cron secret") };
  }
  return { ok: true };
}
