// Shared ElevenLabs conversation → `leads` row mapping.
// Used by both the post-call webhook and the backfill function so the logic
// lives in exactly one place.

export type MapConfig = {
  agentIdNora?: string;
  agentIdBob?: string;
  agentNameMap?: Record<string, string>; // agent_id → display name (Nora/Bob/Vera/…)
  defaultClientId?: string | null;
  agentClientMap?: Record<string, string>; // agent_id → clientId (per-client tagging)
  spreadClientIds?: string[]; // shared agent → distribute calls across these clients
  source: string; // 'call' | 'backfill' | 'import' | 'test'
};

// Stable hash → index, so a given conversation always maps to the same client
// (spread is deterministic, not random per run).
function hashIndex(s: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return mod > 0 ? h % mod : 0;
}

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

// ElevenLabs keys newer data-collection items under an auto-generated id
// (e.g. "aitem_1001m6n…") with the real identifier in `.name`; older items are
// keyed by the identifier directly. Resolve a field by identifier either way.
// deno-lint-ignore no-explicit-any
function fieldByName(data: any, name: string): any {
  if (data?.[name]) return data[name];
  for (const v of Object.values(data ?? {})) {
    // deno-lint-ignore no-explicit-any
    if ((v as any)?.name === name) return v;
  }
  return undefined;
}

const isTrue = (v: unknown) =>
  v === true || String(v).toLowerCase() === "true";

// deno-lint-ignore no-explicit-any
function deriveStatus(
  conv: any,
  analysis: any,
): "Real" | "Unclear" | "NoEngagement" | "Spam" {
  const data = analysis?.data_collection_results ?? {};

  // Spam = an actual solicitor / robocall the agent flagged (someone selling TO
  // us, a recorded message, etc.). This is content-based: the LLM sets the
  // `is_soliciting` data-collection field. Checked first — a talkative robocall
  // should land here, not in "no engagement".
  if (isTrue(fieldByName(data, "is_soliciting")?.value)) {
    return "Spam";
  }

  // How much did the caller actually engage? Count caller turns with real speech.
  const userTurns = (conv?.transcript ?? []).filter(
    // deno-lint-ignore no-explicit-any
    (t: any) => t?.role !== "agent" && String(t?.message ?? "").trim() !== "",
  ).length;
  const duration = conv?.metadata?.call_duration_secs ?? 0;

  // No engagement = the caller never really spoke: silence or an immediate
  // hangup with nothing said. Not spam — they may just have been unable to talk.
  if (userTurns === 0) return "NoEngagement";
  if (userTurns <= 1 && duration > 0 && duration < 8) return "NoEngagement";

  // Real = the caller explicitly consented to be contacted — the strongest
  // signal of a genuine, actionable lead. (Agents name this field differently:
  // Nora uses `consent_to_contact`, Bob/Alex use `consent_given`.)
  const consent =
    fieldByName(data, "consent_to_contact")?.value ??
    fieldByName(data, "consent_given")?.value;
  if (isTrue(consent)) {
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

function agentName(agentId: string | undefined, cfg: MapConfig): string {
  // Prefer the explicit agent_id → name map (scales to any number of agents).
  if (agentId && cfg.agentNameMap?.[agentId]) return cfg.agentNameMap[agentId];
  if (agentId && cfg.agentIdBob && agentId === cfg.agentIdBob) return "Bob";
  return "Nora"; // default
}

// deno-lint-ignore no-explicit-any
export function mapConversationToRow(conv: any, cfg: MapConfig) {
  const analysis = conv?.analysis ?? null;
  const metadata = conv?.metadata ?? {};
  const data = analysis?.data_collection_results ?? {};

  // Return the first non-empty data-collection value among the given keys.
  // Uses fieldByName so it resolves both directly-keyed and `aitem_…`-keyed items.
  const firstVal = (keys: string[]): string | undefined => {
    for (const k of keys) {
      const v = fieldByName(data, k)?.value;
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
    // Client tag priority: explicit agent→client map → deterministic spread
    // across shared-agent clients → default → none.
    clientId:
      cfg.agentClientMap?.[conv?.agent_id] ??
      (cfg.spreadClientIds && cfg.spreadClientIds.length
        ? cfg.spreadClientIds[hashIndex(conversationId, cfg.spreadClientIds.length)]
        : undefined) ??
      cfg.defaultClientId ??
      null,
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
