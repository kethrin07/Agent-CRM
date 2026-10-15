import "server-only";
import crypto from "node:crypto";
import { env, requireEnv } from "@/lib/env";

/**
 * Minimal, fetch-based ElevenLabs Conversational AI client. No SDK dependency.
 * Field shapes mirror the Conversations API `analysis` object confirmed in the
 * docs (call_successful, call_success_score, transcript_summary,
 * evaluation_criteria_results, data_collection_results).
 */

export type EvalOutcome = "success" | "failure" | "unknown";

export type EvaluationResult = {
  result: EvalOutcome;
  rationale?: string;
};

export type DataCollectionResult = {
  value: string | number | boolean | null;
  rationale?: string;
};

export type ConversationAnalysis = {
  call_successful: EvalOutcome;
  call_success_score?: number;
  transcript_summary: string;
  call_summary_title?: string;
  evaluation_criteria_results?: Record<string, EvaluationResult>;
  data_collection_results?: Record<string, DataCollectionResult>;
};

export type TranscriptTurn = {
  role: "user" | "agent";
  time_in_call_secs: number;
  message: string;
};

export type ConversationMetadata = {
  start_time_unix_secs?: number;
  call_duration_secs?: number;
  phone_call?: { external_number?: string; agent_number?: string };
};

export type Conversation = {
  agent_id: string;
  conversation_id: string;
  status: string;
  transcript: TranscriptTurn[];
  metadata: ConversationMetadata;
  analysis: ConversationAnalysis | null;
  has_audio?: boolean;
};

async function elRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const apiKey = requireEnv("elevenLabsApiKey");
  const res = await fetch(`${env.elevenLabsBaseUrl}${path}`, {
    ...init,
    headers: {
      "xi-api-key": apiKey,
      "content-type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`ElevenLabs ${res.status} ${res.statusText}: ${detail}`);
  }
  return res.json() as Promise<T>;
}

/** GET /v1/convai/conversations */
export function listConversations(params: {
  agentId?: string;
  pageSize?: number;
} = {}) {
  const q = new URLSearchParams();
  if (params.agentId) q.set("agent_id", params.agentId);
  if (params.pageSize) q.set("page_size", String(params.pageSize));
  const qs = q.toString();
  return elRequest<{ conversations: Conversation[] }>(
    `/v1/convai/conversations${qs ? `?${qs}` : ""}`,
  );
}

/** GET /v1/convai/conversations/:id */
export function getConversation(conversationId: string) {
  return elRequest<Conversation>(`/v1/convai/conversations/${conversationId}`);
}

/** GET /v1/convai/conversations/:id/audio → raw audio bytes */
export async function getConversationAudio(
  conversationId: string,
): Promise<ArrayBuffer> {
  const apiKey = requireEnv("elevenLabsApiKey");
  const res = await fetch(
    `${env.elevenLabsBaseUrl}/v1/convai/conversations/${conversationId}/audio`,
    { headers: { "xi-api-key": apiKey } },
  );
  if (!res.ok) throw new Error(`ElevenLabs audio ${res.status}`);
  return res.arrayBuffer();
}

/** PATCH /v1/convai/agents/:id — update prompt, voice, first message, etc. */
export function updateAgent(agentId: string, body: Record<string, unknown>) {
  return elRequest<{ agent_id: string }>(`/v1/convai/agents/${agentId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

/**
 * Verify an ElevenLabs post-call webhook signature.
 * Header format: `t=<unix>,v0=<hex hmac of "t.body">`.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret = env.elevenLabsWebhookSecret,
): boolean {
  if (!secret || !signatureHeader) return false;
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((kv) => kv.split("=") as [string, string]),
  );
  const timestamp = parts.t;
  const provided = parts.v0;
  if (!timestamp || !provided) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Resolve an agent name ("Nora"/"Bob") to its configured agent id. */
export function agentIdFor(name: string): string | undefined {
  if (name.toLowerCase() === "nora") return env.elevenLabsAgentIdNora;
  if (name.toLowerCase() === "bob") return env.elevenLabsAgentIdBob;
  return undefined;
}
