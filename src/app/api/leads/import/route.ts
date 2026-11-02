import { NextResponse } from "next/server";
import { isConfigured } from "@/lib/env";
import { getSupabaseAdmin, LEADS_TABLE } from "@/lib/integrations/supabase";
import type { Lead } from "@/lib/data";

/**
 * POST /api/leads/import
 * Body: { leads: Lead[] } — parsed CSV rows from the import dialog. Upserts them
 * into Supabase (tagged source='import') using the service-role key, so the
 * browser never writes directly. Keyed on id, so re-imports don't duplicate.
 */
export async function POST(req: Request) {
  if (!isConfigured("supabase")) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 501 },
    );
  }

  let body: { leads?: Lead[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const leads = Array.isArray(body?.leads) ? body.leads : [];
  if (leads.length === 0) {
    return NextResponse.json({ error: "No leads to import" }, { status: 400 });
  }

  const rows = leads.map((l) => ({ ...l, source: "import" }));

  try {
    const { error } = await getSupabaseAdmin()
      .from(LEADS_TABLE)
      .upsert(rows, { onConflict: "id" });
    if (error) throw error;
    return NextResponse.json({ ok: true, count: rows.length });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Import failed" },
      { status: 502 },
    );
  }
}
