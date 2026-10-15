import { NextResponse } from "next/server";
import { isConfigured } from "@/lib/env";
import { updateAgent } from "@/lib/integrations/elevenlabs";

/**
 * PATCH /api/agents/:id
 * Pushes agent config changes (prompt, first message, voice, LLM…) to
 * ElevenLabs. Backs the "Publish changes" button once keys are present.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isConfigured("elevenlabs")) {
    return NextResponse.json(
      { error: "ElevenLabs not configured" },
      { status: 501 },
    );
  }

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  try {
    const result = await updateAgent(id, body);
    return NextResponse.json({ ok: true, agent: result });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 502 },
    );
  }
}
