import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function decodeJWTPayload(token: string | null) {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch (_e) {
    return null;
  }
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    // Require a valid user session (verify_jwt=true will already enforce validity)
    const payload = decodeJWTPayload(token);
    const isAdmin = Boolean(
      payload?.user_metadata?.role === "admin" ||
      payload?.role === "admin" ||
      payload?.app_metadata?.role === "admin"
    );

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ success: false, error: "forbidden", message: "Admin required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    // We always expect a JSON body with an action
    const body = await req.json().catch(() => ({}));
    const action = body?.action as string | undefined;

    // LIST
    if (action === "list") {
      console.log("📋 LIST schedules request");
      const { data, error } = await supabase
        .from("blog_automation_schedules")
        .select("*, category:blog_categories(id, name, slug, icon)")
        .order("schedule_day", { ascending: true })
        .order("schedule_time", { ascending: true });

      if (error) {
        console.error("❌ LIST error:", error);
        throw error;
      }
      console.log(`✅ LIST success: ${data?.length || 0} schedules`);
      return new Response(
        JSON.stringify({ success: true, schedules: data ?? [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // CREATE
    if (action === "create") {
      console.log("➕ CREATE schedule request:", body?.payload);
      const nowDefaults = {
        name: "Nouvelle planification",
        enabled: true,
        category_id: null as string | null,
        schedule_day: 1,
        schedule_time: "08:00",
        auto_publish: false,
        ai_model: "google/gemini-2.5-flash",
        prompt_template: null as string | null,
      };
      const payloadInput = body?.payload ?? {};
      const toInsert = { ...nowDefaults, ...payloadInput };

      const { data: inserted, error: insertError } = await supabase
        .from("blog_automation_schedules")
        .insert(toInsert)
        .select("id")
        .single();

      if (insertError) {
        console.error("❌ CREATE insert error:", insertError);
        throw insertError;
      }

      const { data: row, error: fetchError } = await supabase
        .from("blog_automation_schedules")
        .select("*, category:blog_categories(id, name, slug, icon)")
        .eq("id", inserted.id)
        .maybeSingle();

      if (fetchError) {
        console.error("❌ CREATE fetch error:", fetchError);
        throw fetchError;
      }

      console.log("✅ CREATE success:", row?.id);
      return new Response(
        JSON.stringify({ success: true, schedule: row }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // UPDATE
    if (action === "update") {
      const id = body?.id as string | undefined;
      const payloadInput = body?.payload ?? {};
      if (!id) {
        return new Response(
          JSON.stringify({ success: false, error: "invalid_request", message: "id is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const allowed: Record<string, unknown> = {};
      for (const key of [
        "name",
        "enabled",
        "category_id",
        "schedule_day",
        "schedule_time",
        "auto_publish",
        "ai_model",
        "prompt_template",
      ]) {
        if (key in payloadInput) (allowed as any)[key] = payloadInput[key];
      }

      const { error: updateError } = await supabase
        .from("blog_automation_schedules")
        .update(allowed)
        .eq("id", id);

      if (updateError) throw updateError;

      const { data: row, error: fetchError } = await supabase
        .from("blog_automation_schedules")
        .select("*, category:blog_categories(id, name, slug, icon)")
        .eq("id", id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      return new Response(
        JSON.stringify({ success: true, schedule: row }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // DELETE
    if (action === "delete") {
      const id = body?.id as string | undefined;
      if (!id) {
        return new Response(
          JSON.stringify({ success: false, error: "invalid_request", message: "id is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error: delError } = await supabase
        .from("blog_automation_schedules")
        .delete()
        .eq("id", id);

      if (delError) throw delError;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Unknown action
    return new Response(
      JSON.stringify({ success: false, error: "invalid_action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("blog-schedules error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
