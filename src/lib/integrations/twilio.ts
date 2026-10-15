import "server-only";
import { env, requireEnv } from "@/lib/env";

/**
 * Thin Twilio placeholder. In this architecture most telephony work happens by
 * importing a Twilio number into ElevenLabs (which then owns the media stream),
 * so this module only holds credentials + a documented stub. Flesh out when the
 * number-provisioning flow is built.
 */

export const twilioConfig = {
  get accountSid() {
    return requireEnv("twilioAccountSid");
  },
  get authToken() {
    return requireEnv("twilioAuthToken");
  },
};

export const twilioConfigured = Boolean(
  env.twilioAccountSid && env.twilioAuthToken,
);

/**
 * Stub: import a Twilio number into an ElevenLabs agent.
 * Real implementation calls ElevenLabs' phone-numbers endpoint with the Twilio
 * SID/token so the agent answers inbound calls on that number.
 */
export async function importNumberToAgent(_params: {
  phoneNumber: string;
  agentId: string;
}): Promise<never> {
  void _params;
  throw new Error("importNumberToAgent is not implemented yet.");
}
