// Shared ElevenLabs conversation → `leads` row mapping.
// Used by both the post-call webhook and the backfill function so the logic
// lives in exactly one place.

export type MapConfig = {
  agentIdNora?: string;
  agentIdBob?: string;
  defaultClientId?: string | null;
  source: string; // 'call' | 'backfill' | 'import' | 'test'
};

export function toScore(raw?: number): number {
  if (raw == null) return 0;
  const scaled = raw <= 1 ? raw * 100 : raw;
  return Math.max(0, Math.min(100, Math.round(scaled)));
}

export function fmtDur(secs?: number): string {
  if (!secs || secs < 0) return "0:00";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// deno-lint-ignore no-explicit-any
function deriveStatus(conv: any, analysis: any): "Real" | "Unclear" | "Spam" {
  // How much did the caller actually engage? Count caller turns with real speech.
  const userTurns = (conv?.transcript ?? []).filter(
    // deno-lint-ignore no-explicit-any
    (t: any) => t?.role !== "agent" && String(t?.message ?? "").trim() !== "",
  ).length;
  const duration = conv?.metadata?.call_duration_secs ?? 0;

  // Spam = no real engagement: silence, robocall, or an immediate hangup with
  // nothing said. A real person who talked is never spam — even if they hung up
  // early before finishing.
  if (userTurns === 0) return "Spam";
  if (userTurns <= 1 && duration > 0 && duration < 8) return "Spam";

  // Real = the caller explicitly consented to be contacted — the strongest
  // signal of a genuine, actionable lead.
  const data = analysis?.data_collection_results ?? {};
  const consent = data?.consent_to_contact?.value;
  if (consent === true || String(consent).toLowerCase() === "true") {
    return "Real";
  }

  // …or fully qualified: all of the agent's evaluation criteria passed.
  const results = Object.values(analysis?.evaluation_criteria_results ?? {});
  // deno-lint-ignore no-explicit-any
  if (results.length > 0 && results.every((r: any) => r?.result === "success")) {
    return "Real";
  }

  // Engaged but didn't consent / complete (e.g. hung up before giving a number).
  return "Unclear";
}

function agentName(
  agentId: string | undefined,
  cfg: MapConfig,
): "Nora" | "Bob" | "Imported" {
  if (agentId && cfg.agentIdBob && agentId === cfg.agentIdBob) return "Bob";
  return "Nora"; // single-agent setup → default
}

// deno-lint-ignore no-explicit-any
export function mapConversationToRow(conv: any, cfg: MapConfig) {
  const analysis = conv?.analysis ?? null;
  const metadata = conv?.metadata ?? {};
  const data = analysis?.data_collection_results ?? {};

  // Return the first non-empty data-collection value among the given keys.
  const firstVal = (keys: string[]): string | undefined => {
    for (const k of keys) {
      const v = data?.[k]?.value;
      if (v != null && String(v).trim() !== "") return String(v);
    }
    return undefined;
  };

  const conversationId: string = conv?.conversation_id ?? crypto.randomUUID();
  const started = metadata?.start_time_unix_secs
    ? new Date(metadata.start_time_unix_secs * 1000)
    : new Date();

  // deno-lint-ignore no-explicit-any
  const transcript = (conv?.transcript ?? []).map((turn: any) => ({
    t: fmtDur(turn?.time_in_call_secs),
    who: turn?.role === "agent" ? "agent" : "caller",
    text: turn?.message ?? "",
  }));

  return {
    id: conversationId, // stable key → idempotent across webhook + backfill
    name:
      firstVal(["homeowner_name", "full_name", "name", "caller_name"]) ??
      "Unknown caller",
    phone:
      metadata?.phone_call?.external_number ||
      firstVal(["homeowner_phone_number", "phone", "phone_number"]) ||
      "",
    status: deriveStatus(conv, analysis),
    score: toScore(analysis?.call_success_score),
    intent:
      analysis?.call_summary_title ??
      analysis?.transcript_summary ??
      firstVal(["project_description", "project_type"]) ??
      "",
    dur: fmtDur(metadata?.call_duration_secs),
    agent: agentName(conv?.agent_id, cfg),
    ts: started.toISOString(),
    when: started.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
    stage: "New",
    assigneeId: null,
    clientId: cfg.defaultClientId ?? null,
    conversationId,
    summary: analysis?.transcript_summary ?? null,
    durationSecs: metadata?.call_duration_secs ?? null,
    transcript,
    dataFields: analysis?.data_collection_results ?? null,
    qualification: analysis?.evaluation_criteria_results ?? null,
    hasAudio: conv?.has_audio ?? null,
    source: cfg.source,
  };
}
