import { NextResponse } from "next/server";
import { isConfigured } from "@/lib/env";
import {
  verifyWebhookSignature,
  type Conversation,
} from "@/lib/integrations/elevenlabs";
import { conversationToLead } from "@/lib/integrations/map";
import { getSupabaseAdmin, LEADS_TABLE } from "@/lib/integrations/supabase";

/**
 * POST /api/webhooks/elevenlabs
 * ElevenLabs post-call webhook. Verifies the HMAC signature, maps the
 * conversation into a lead, and upserts it into Supabase. This is the URL shown
 * in the Agent-settings "Post-call webhook" box.
 *
 * No-ops gracefully (logs + 200) until keys are configured, so ElevenLabs test
 * pings don't error during setup.
 */
export async function POST(req: Request) {
  const rawBody = await req.text();

  if (!isConfigured("elevenlabs") || !isConfigured("supabase")) {
    console.warn("[elevenlabs-webhook] ignored — integration not configured");
    return NextResponse.json({ ok: true, ignored: true });
  }

  const signature = req.headers.get("elevenlabs-signature");
  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: { data?: Conversation } | Conversation;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Post-call events wrap the conversation under `data`.
  const conversation = (
    "data" in payload && payload.data ? payload.data : payload
  ) as Conversation;

  try {
    const lead = conversationToLead(conversation);
    const { error } = await getSupabaseAdmin()
      .from(LEADS_TABLE)
      .upsert(lead, { onConflict: "id" });
    if (error) throw error;
    return NextResponse.json({ ok: true, lead_id: lead.id });
  } catch (err) {
    console.error("[elevenlabs-webhook]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Processing failed" },
      { status: 500 },
    );
  }
}
