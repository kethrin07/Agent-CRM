import "server-only";

/**
 * Server-only environment access.
 *
 * Reads are lazy and NON-throwing at import/build time, so the app builds and
 * runs with no keys present. Call `requireEnv()` inside a handler to get a
 * clear error only when a value is actually needed, or gate work behind
 * `isConfigured()`.
 *
 * Real values live in `.env.local` (gitignored). Never import this from a
 * Client Component — `server-only` will throw if you do.
 */

export const env = {
  // ElevenLabs
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY,
  elevenLabsWebhookSecret: process.env.ELEVENLABS_WEBHOOK_SECRET,
  elevenLabsAgentIdNora: process.env.ELEVENLABS_AGENT_ID_NORA,
  elevenLabsAgentIdBob: process.env.ELEVENLABS_AGENT_ID_BOB,
  elevenLabsBaseUrl:
    process.env.ELEVENLABS_BASE_URL || "https://api.elevenlabs.io",

  // Supabase
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // Twilio
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
} as const;

export type Service = "elevenlabs" | "supabase" | "twilio";

/** True when the minimum env for a service is present. */
export function isConfigured(service: Service): boolean {
  switch (service) {
    case "elevenlabs":
      return Boolean(env.elevenLabsApiKey);
    case "supabase":
      return Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);
    case "twilio":
      return Boolean(env.twilioAccountSid && env.twilioAuthToken);
  }
}

/** Reads a required var, throwing a clear error if it is missing. */
export function requireEnv(name: keyof typeof env): string {
  const value = env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable for "${String(name)}". Add it to .env.local (see .env.example).`,
    );
  }
  return value;
}
