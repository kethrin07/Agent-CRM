import { isConfigured } from "@/lib/env";
import { getConversationAudio } from "@/lib/integrations/elevenlabs";

/**
 * GET /api/leads/[id]/audio
 * Streams a conversation's recording from ElevenLabs. `id` is the
 * conversation_id. The ElevenLabs API key stays server-side — the browser only
 * ever hits this route.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isConfigured("elevenlabs")) {
    return new Response("ElevenLabs not configured", { status: 501 });
  }

  const { id } = await params;
  try {
    const audio = await getConversationAudio(id);
    return new Response(audio, {
      headers: {
        "content-type": "audio/mpeg",
        "cache-control": "private, max-age=3600",
      },
    });
  } catch (err) {
    // Surface the upstream ElevenLabs status (e.g. "ElevenLabs audio 401" vs
    // "ElevenLabs audio 404") so we can tell a permission issue from no-audio.
    const msg = err instanceof Error ? err.message : "Recording unavailable";
    return new Response(msg, { status: 404 });
  }
}
