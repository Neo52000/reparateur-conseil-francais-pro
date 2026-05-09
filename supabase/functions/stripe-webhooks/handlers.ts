/**
 * Pure helpers for the Stripe webhook handler.
 *
 * Why this file: the Edge Function imports Stripe + Supabase via URL
 * (`https://esm.sh/...`), which makes it hard to unit-test under Vitest.
 * Here we use structural typing (`StripeLike`, `SupabaseClientLike`) so
 * tests can pass mocks without touching URL imports.
 *
 * The real `index.ts` instantiates the actual Stripe / Supabase clients
 * and calls these helpers — single source of truth for the
 * security-critical bits (signature verification + idempotence).
 */

// ---------- Structural types (so Vitest can mock without URL imports) ----------

export interface StripeEventLike {
  id: string;
  type: string;
}

export interface StripeLike {
  webhooks: {
    constructEventAsync(
      payload: string,
      signature: string,
      secret: string,
    ): Promise<StripeEventLike>;
  };
}

export interface PostgrestErrorLike {
  code?: string;
  message?: string;
}

export interface SupabaseUpdateBuilder {
  eq(column: string, value: unknown): Promise<{ error: PostgrestErrorLike | null }>;
}

export interface SupabaseTableBuilder {
  insert(data: unknown): Promise<{ error: PostgrestErrorLike | null }>;
  update(data: unknown): SupabaseUpdateBuilder;
}

export interface SupabaseClientLike {
  from(table: string): SupabaseTableBuilder;
}

// ---------- Result types ----------

export type RecordResult =
  | { status: "inserted" }
  | { status: "duplicate" }
  | { status: "error"; message: string };

// ---------- Helpers ----------

/**
 * Verify the `stripe-signature` header against the raw body using the
 * webhook secret. Throws if the signature is missing, malformed, expired
 * or doesn't match the body — never trust an unverified payload.
 */
export async function verifyStripeSignature(
  stripe: StripeLike,
  body: string,
  signature: string,
  webhookSecret: string,
): Promise<StripeEventLike> {
  return await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
}

/**
 * Idempotence guard: insert one row per Stripe event id. The DB has a
 * UNIQUE constraint on `stripe_event_id`, so a retry from Stripe trips
 * a 23505 (unique_violation) which we translate to `duplicate` and
 * acknowledge with HTTP 200 (otherwise Stripe retries forever).
 */
export async function recordWebhookEvent(
  supabase: SupabaseClientLike,
  event: StripeEventLike & { payload: unknown },
): Promise<RecordResult> {
  const { error } = await supabase.from("stripe_webhooks").insert({
    stripe_event_id: event.id,
    event_type: event.type,
    payload: event.payload,
    processed: false,
  });

  if (error?.code === "23505") return { status: "duplicate" };
  if (error) return { status: "error", message: error.message ?? "unknown insert error" };
  return { status: "inserted" };
}

/**
 * Mark an event as successfully processed (called after the business
 * logic for the event type completes without throwing).
 */
export async function markEventProcessed(
  supabase: SupabaseClientLike,
  eventId: string,
): Promise<void> {
  await supabase
    .from("stripe_webhooks")
    .update({
      processed: true,
      processed_at: new Date().toISOString(),
    })
    .eq("stripe_event_id", eventId);
}

/**
 * Mark an event as failed (called from the catch block when business
 * logic throws). Preserves the error text so operators can investigate.
 */
export async function markEventFailed(
  supabase: SupabaseClientLike,
  eventId: string,
  errorMessage: string,
): Promise<void> {
  await supabase
    .from("stripe_webhooks")
    .update({
      processed: false,
      error_message: errorMessage,
    })
    .eq("stripe_event_id", eventId);
}
