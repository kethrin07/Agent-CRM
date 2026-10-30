import { env, isConfigured } from "@/lib/env";
import { listConversations } from "@/lib/integrations/elevenlabs";

/**
 * GET /api/live-calls
 * Returns the conversations ElevenLabs currently reports as in-progress, so the
 * dashboard can show "the agent is on a call now". Post-call data still comes
 * via the webhook; this is just a live status poll. Keys stay server-side.
 */

// ElevenLabs status strings that mean the call is still happening.
const LIVE = new Set(["in-progress", "in_progress", "ongoing", "initiated"]);

export async function GET(req: Request) {
  if (!isConfigured("elevenlabs")) {
    return Response.json({ calls: [] });
  }

  try {
    const { conversations } = await listConversations({ pageSize: 50 });

    // ?debug=1 → also list recent statuses, to confirm the "live" strings.
    if (new URL(req.url).searchParams.get("debug")) {
      return Response.json({
        statuses: (conversations ?? [])
          .slice(0, 10)
          .map((c) => ({ id: c.conversation_id, status: c.status })),
      });
    }

    const calls = (conversations ?? [])
      .filter((c) => LIVE.has(String(c.status ?? "").toLowerCase()))
      .map((c) => {
        // list items may carry fields at the top level or under metadata
        const m = c.metadata ?? {};
        const startSecs =
          m.start_time_unix_secs ??
          (c as { start_time_unix_secs?: number }).start_time_unix_secs;
        const agent =
          c.agent_id && c.agent_id === env.elevenLabsAgentIdBob ? "Bob" : "Nora";
        return {
          id: c.conversation_id,
          agent,
          caller: m.phone_call?.external_number ?? "Web caller",
          startedAt: startSecs ? startSecs * 1000 : Date.now(),
        };
      });
    return Response.json({ calls });
  } catch {
    return Response.json({ calls: [] });
  }
}
