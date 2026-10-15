import "server-only";
import { env } from "@/lib/env";
import type { Conversation } from "./elevenlabs";
import type { Lead, Status } from "@/lib/data";

/**
 * Bridges an ElevenLabs conversation payload into the app's `Lead` shape
 * (see src/lib/data.ts). Used by the post-call webhook and, later, by the UI
 * swap off mock data.
 */

function formatDuration(secs?: number): string {
  if (!secs || secs < 0) return "0:00";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function agentName(agentId: string): "Nora" | "Bob" {
  if (agentId && agentId === env.elevenLabsAgentIdBob) return "Bob";
  return "Nora";
}

/** ElevenLabs returns a success score; normalise to a 0–100 integer. */
function toScore(raw?: number): number {
  if (raw == null) return 0;
  const scaled = raw <= 1 ? raw * 100 : raw;
  return Math.max(0, Math.min(100, Math.round(scaled)));
}

/**
 * Map ElevenLabs evaluation results → the app's Real / Unclear / Spam label.
 * Heuristic: a failed/very-short call reads as Spam; all criteria passing reads
 * as Real; anything mixed is Unclear. Tune to match your criteria config.
 */
function deriveStatus(conv: Conversation): Status {
  const a = conv.analysis;
  const score = toScore(a?.call_success_score);
  if (!a || a.call_successful === "failure" || score < 15) return "Spam";

  const results = Object.values(a.evaluation_criteria_results ?? {});
  if (results.length > 0 && results.every((r) => r.result === "success")) {
    return "Real";
  }
  return "Unclear";
}

function slug(name: string, fallback: string): string {
  return (
    name.toLowerCase().replace(/[^a-z]+/g, "-").replace(/(^-|-$)/g, "") ||
    fallback
  );
}

export function conversationToLead(conv: Conversation): Lead {
  const data = conv.analysis?.data_collection_results ?? {};
  const str = (key: string): string | undefined => {
    const v = data[key]?.value;
    return v == null ? undefined : String(v);
  };

  const name = str("full_name") ?? "Unknown caller";
  const phone = conv.metadata.phone_call?.external_number ?? "";

  return {
    id: slug(name, conv.conversation_id),
    name,
    phone,
    status: deriveStatus(conv),
    score: toScore(conv.analysis?.call_success_score),
    intent:
      conv.analysis?.call_summary_title ??
      conv.analysis?.transcript_summary ??
      "",
    dur: formatDuration(conv.metadata.call_duration_secs),
    agent: agentName(conv.agent_id),
    when: conv.metadata.start_time_unix_secs
      ? new Date(conv.metadata.start_time_unix_secs * 1000).toLocaleString()
      : "",
    // New lead enters the pipeline unworked + unassigned.
    stage: "New",
    assigneeId: null,
  };
}
