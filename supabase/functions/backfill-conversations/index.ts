// Supabase Edge Function: one-time backfill of past ElevenLabs conversations.
//
// Pulls the agent's conversation history via the ElevenLabs API, maps each one
// (shared logic with the webhook), and upserts into `leads`. Idempotent — keyed
// on conversation_id, so it won't duplicate rows the webhook already caught.
//
// Deploy:  supabase functions deploy backfill-conversations --no-verify-jwt
// Secret:  supabase secrets set ELEVENLABS_API_KEY=sk_...  (shared across functions)
// Run:     curl -X POST https://<project-ref>.supabase.co/functions/v1/backfill-conversations

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { mapConversationToRow } from "../_shared/mapping.ts";

const API_KEY = Deno.env.get("ELEVENLABS_API_KEY") ?? "";
const BASE_URL = Deno.env.get("ELEVENLABS_BASE_URL") ?? "https://api.elevenlabs.io";
const AGENT_ID_NORA = Deno.env.get("ELEVENLABS_AGENT_ID_NORA") ?? "";
const AGENT_ID_BOB = Deno.env.get("ELEVENLABS_AGENT_ID_BOB") ?? "";
const DEFAULT_CLIENT_ID = Deno.env.get("DEFAULT_CLIENT_ID") ?? null;

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

async function el(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "xi-api-key": API_KEY },
  });
  if (!res.ok) {
    throw new Error(`ElevenLabs ${res.status}: ${await res.text().catch(() => "")}`);
  }
  return res.json();
}

Deno.serve(async () => {
  if (!API_KEY) {
    return json({ error: "ELEVENLABS_API_KEY not set" }, 500);
  }

  try {
    // 1) Collect all conversation ids (paginated).
    const ids: string[] = [];
    let cursor = "";
    do {
      const q = new URLSearchParams();
      if (AGENT_ID_NORA) q.set("agent_id", AGENT_ID_NORA);
      q.set("page_size", "100");
      if (cursor) q.set("cursor", cursor);
      const page = await el(`/v1/convai/conversations?${q.toString()}`);
      // deno-lint-ignore no-explicit-any
      for (const c of page?.conversations ?? []) {
        if (c?.conversation_id) ids.push(c.conversation_id);
      }
      cursor = page?.has_more ? (page?.next_cursor ?? "") : "";
    } while (cursor);

    // 2) Fetch full detail for each (needed for transcript + analysis) and map.
    const rows = [];
    for (const id of ids) {
      const conv = await el(`/v1/convai/conversations/${id}`);
      rows.push(
        mapConversationToRow(conv, {
          agentIdNora: AGENT_ID_NORA,
          agentIdBob: AGENT_ID_BOB,
          defaultClientId: DEFAULT_CLIENT_ID,
          source: "backfill",
        }),
      );
    }

    // 3) Upsert in bulk (idempotent on id/conversation_id).
    if (rows.length > 0) {
      const { error } = await supabase
        .from("leads")
        .upsert(rows, { onConflict: "id" });
      if (error) throw error;
    }

    return json({ ok: true, found: ids.length, imported: rows.length });
  } catch (err) {
    console.error("[backfill]", err);
    return json(
      { error: err instanceof Error ? err.message : "Backfill failed" },
      500,
    );
  }
});
