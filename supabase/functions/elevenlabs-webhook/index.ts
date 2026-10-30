// Supabase Edge Function: ElevenLabs post-call webhook → leads table.
//
// Verifies the HMAC signature, maps the payload (shared with backfill), and
// upserts it. Hosted by Supabase — no ngrok / no running app needed.
//
// Deploy:  supabase functions deploy elevenlabs-webhook --no-verify-jwt
// Secret:  supabase secrets set ELEVENLABS_WEBHOOK_SECRET=whsec_...
// URL:     https://<project-ref>.supabase.co/functions/v1/elevenlabs-webhook

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { mapConversationToRow } from "../_shared/mapping.ts";

const WEBHOOK_SECRET = Deno.env.get("ELEVENLABS_WEBHOOK_SECRET") ?? "";
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

// Verify ElevenLabs' signature header: `t=<unix>,v0=<hex hmac of "t.body">`.
async function verifySignature(
  header: string | null,
  rawBody: string,
): Promise<boolean> {
  if (!WEBHOOK_SECRET) return true; // no secret set yet → skip (set it before prod!)
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(",").map((kv) => kv.split("=") as [string, string]),
  );
  const t = parts["t"];
  const v0 = parts["v0"];
  if (!t || !v0) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(`${t}.${rawBody}`));
  const expected = [...new Uint8Array(sigBuf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (expected.length !== v0.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ v0.charCodeAt(i);
  }
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const rawBody = await req.text();
  const signature =
    req.headers.get("elevenlabs-signature") ??
    req.headers.get("ElevenLabs-Signature");

  if (!(await verifySignature(signature, rawBody))) {
    return json({ error: "Invalid signature" }, 401);
  }

  // deno-lint-ignore no-explicit-any
  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  // Post-call events wrap the conversation under `data`.
  const conv = payload?.data ?? payload;
  const row = mapConversationToRow(conv, {
    agentIdNora: AGENT_ID_NORA,
    agentIdBob: AGENT_ID_BOB,
    defaultClientId: DEFAULT_CLIENT_ID,
    source: "call",
  });

  const { error } = await supabase
    .from("leads")
    .upsert(row, { onConflict: "id" });

  if (error) {
    console.error("[elevenlabs-webhook] insert failed:", error.message);
    return json({ error: error.message }, 500);
  }

  console.log("[elevenlabs-webhook] upserted lead:", row.id);
  return json({ ok: true, lead_id: row.id });
});
