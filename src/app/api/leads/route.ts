import { NextResponse } from "next/server";
import { isConfigured } from "@/lib/env";
import { getSupabaseAdmin, LEADS_TABLE } from "@/lib/integrations/supabase";

/**
 * GET /api/leads
 * Reads leads from Supabase. Ready for the eventual UI swap off mock data.
 * Returns 501 until Supabase keys are configured.
 */
export async function GET() {
  if (!isConfigured("supabase")) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 501 },
    );
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from(LEADS_TABLE)
      .select("*")
      .order("ts", { ascending: false });
    if (error) {
      // Surface the real Supabase error (message/code/hint) for debugging.
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        },
        { status: 502 },
      );
    }
    return NextResponse.json({ leads: data ?? [] });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : ((err as { message?: string })?.message ?? "Query failed");
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
