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
    if (error) throw error;
    return NextResponse.json({ leads: data ?? [] });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Query failed" },
      { status: 502 },
    );
  }
}
