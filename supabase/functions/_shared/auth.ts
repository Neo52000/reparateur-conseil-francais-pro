/**
 * Shared auth helpers for Supabase Edge Functions.
 *
 * - `requireAdmin(req)` verifies the JWT signature via Supabase Auth then
 *   checks `has_role(_, 'admin')`.
 * - `requireCronSecret(req)` validates the `x-cron-secret` header against the
 *   `CRON_SECRET` env var — used by scheduled jobs that don't have a user.
 *
 * Both return either `{ ok: true, ... }` or `{ ok: false, response }` so the
 * caller can `return result.response` immediately.
 *
 * Why we always re-verify the JWT here: functions with `verify_jwt = false`
 * (e.g. dual-caller endpoints like `ai-cmo-worker`) bypass the Supabase
 * gateway. A naive `atob(payload).sub` lets an attacker forge an admin JWT.
 * `supabase.auth.getUser(token)` validates the signature against the project
 * JWT secret.
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

/**
 * Require the caller to be an authenticated admin.
 * Verifies the JWT signature via `supabase.auth.getUser(token)` then calls
 * the server-side `has_role` RPC — never trusts unsigned JWT metadata.
 */
export async function requireAdmin(
  req: Request,
): Promise<AuthOk<{ userId: string }> | AuthFail> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { ok: false, response: jsonError(req, 401, "missing_auth", "Bearer token required") };
  }
  const token = authHeader.slice(7).trim();
  if (!token) {
    return { ok: false, response: jsonError(req, 401, "missing_auth", "Bearer token required") };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return { ok: false, response: jsonError(req, 500, "server_misconfigured", "Supabase env vars missing") };
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  // Verifies JWT signature + expiry against the project's JWT secret.
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    return { ok: false, response: jsonError(req, 401, "invalid_token", "Bearer token is invalid or expired") };
  }
  const userId = userData.user.id;

  const { data: hasRole, error: roleError } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });

  if (roleError) {
    console.error("requireAdmin: has_role RPC error", roleError);
    return { ok: false, response: jsonError(req, 500, "auth_check_failed", "Could not verify admin role") };
  }

  if (!hasRole) {
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
