import { describe, expect, it, vi } from "vitest";
import {
  markEventFailed,
  markEventProcessed,
  recordWebhookEvent,
  verifyStripeSignature,
  type StripeLike,
  type SupabaseClientLike,
} from "../handlers";

// ----- helpers ---------------------------------------------------------

/**
 * Build a fake supabase chain: `from(t).insert(x)` resolves to whatever
 * the caller specifies; `from(t).update(x).eq(c, v)` does the same.
 * Returns the chain plus jest spies so tests can assert on the calls.
 */
function makeSupabase(opts: {
  insertResult?: { error: { code?: string; message?: string } | null };
  updateResult?: { error: { code?: string; message?: string } | null };
} = {}) {
  const insertResult = opts.insertResult ?? { error: null };
  const updateResult = opts.updateResult ?? { error: null };

  const insertSpy = vi.fn().mockResolvedValue(insertResult);
  const eqSpy = vi.fn().mockResolvedValue(updateResult);
  const updateSpy = vi.fn().mockReturnValue({ eq: eqSpy });
  const fromSpy = vi.fn().mockReturnValue({
    insert: insertSpy,
    update: updateSpy,
  });

  const supabase: SupabaseClientLike = { from: fromSpy };
  return { supabase, fromSpy, insertSpy, updateSpy, eqSpy };
}

// ----- verifyStripeSignature ------------------------------------------

describe("verifyStripeSignature", () => {
  it("returns the parsed event on a valid signature", async () => {
    const event = { id: "evt_123", type: "payment_intent.succeeded" };
    const stripe: StripeLike = {
      webhooks: {
        constructEventAsync: vi.fn().mockResolvedValue(event),
      },
    };

    const result = await verifyStripeSignature(stripe, "{}", "sig_123", "whsec_xxx");

    expect(result).toEqual(event);
    expect(stripe.webhooks.constructEventAsync).toHaveBeenCalledWith(
      "{}",
      "sig_123",
      "whsec_xxx",
    );
  });

  it("rethrows when the SDK rejects an invalid signature", async () => {
    const stripe: StripeLike = {
      webhooks: {
        constructEventAsync: vi.fn().mockRejectedValue(new Error("No signatures found matching the expected signature")),
      },
    };

    await expect(
      verifyStripeSignature(stripe, '{"id":"evt_xxx"}', "sig_bad", "whsec_xxx"),
    ).rejects.toThrow(/No signatures found/);
  });

  it("rethrows when the body has been tampered with after signing", async () => {
    const stripe: StripeLike = {
      webhooks: {
        constructEventAsync: vi.fn().mockRejectedValue(new Error("Signature mismatch")),
      },
    };

    await expect(
      verifyStripeSignature(stripe, "{tampered}", "sig_123", "whsec_xxx"),
    ).rejects.toThrow(/mismatch/);
  });

  it("propagates the SDK error verbatim (no swallowing)", async () => {
    const sdkError = new Error("custom SDK message");
    const stripe: StripeLike = {
      webhooks: {
        constructEventAsync: vi.fn().mockRejectedValue(sdkError),
      },
    };

    await expect(verifyStripeSignature(stripe, "", "", "")).rejects.toBe(sdkError);
  });
});

// ----- recordWebhookEvent (idempotence) -------------------------------

describe("recordWebhookEvent", () => {
  const event = { id: "evt_abc", type: "payment_intent.succeeded", payload: { foo: 1 } };

  it("returns 'inserted' when the row is fresh", async () => {
    const { supabase, fromSpy, insertSpy } = makeSupabase();

    const result = await recordWebhookEvent(supabase, event);

    expect(result).toEqual({ status: "inserted" });
    expect(fromSpy).toHaveBeenCalledWith("stripe_webhooks");
    expect(insertSpy).toHaveBeenCalledWith({
      stripe_event_id: "evt_abc",
      event_type: "payment_intent.succeeded",
      payload: { foo: 1 },
      processed: false,
    });
  });

  it("returns 'duplicate' when the unique constraint trips (Stripe retry)", async () => {
    const { supabase } = makeSupabase({
      insertResult: { error: { code: "23505", message: "duplicate key value" } },
    });

    const result = await recordWebhookEvent(supabase, event);

    expect(result).toEqual({ status: "duplicate" });
  });

  it("returns 'error' for any other Postgres error", async () => {
    const { supabase } = makeSupabase({
      insertResult: { error: { code: "42P01", message: "relation does not exist" } },
    });

    const result = await recordWebhookEvent(supabase, event);

    expect(result).toEqual({ status: "error", message: "relation does not exist" });
  });

  it("falls back to a generic message when the error has no `message`", async () => {
    const { supabase } = makeSupabase({ insertResult: { error: { code: "08000" } } });

    const result = await recordWebhookEvent(supabase, event);

    expect(result).toEqual({ status: "error", message: "unknown insert error" });
  });
});

// ----- markEventProcessed ---------------------------------------------

describe("markEventProcessed", () => {
  it("flips the row to processed=true and stamps processed_at", async () => {
    const { supabase, fromSpy, updateSpy, eqSpy } = makeSupabase();

    await markEventProcessed(supabase, "evt_xyz");

    expect(fromSpy).toHaveBeenCalledWith("stripe_webhooks");
    const updateArg = updateSpy.mock.calls[0][0] as { processed: boolean; processed_at: string };
    expect(updateArg.processed).toBe(true);
    expect(updateArg.processed_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(eqSpy).toHaveBeenCalledWith("stripe_event_id", "evt_xyz");
  });
});

// ----- markEventFailed -------------------------------------------------

describe("markEventFailed", () => {
  it("flips the row to processed=false with the error message", async () => {
    const { supabase, updateSpy, eqSpy } = makeSupabase();

    await markEventFailed(supabase, "evt_zzz", "RPC blew up");

    expect(updateSpy).toHaveBeenCalledWith({
      processed: false,
      error_message: "RPC blew up",
    });
    expect(eqSpy).toHaveBeenCalledWith("stripe_event_id", "evt_zzz");
  });
});
