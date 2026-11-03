import type { Lead } from "./data";

/**
 * Demo dataset for DEMO MODE (NEXT_PUBLIC_DEMO_MODE=true). Lets the same codebase
 * run a polished mock version (no Supabase/ElevenLabs) for sales demos, while the
 * real deployment uses live data. Dates are generated relative to "now" so the
 * dashboard always has recent data across the 24h / 7d / 30d ranges.
 */

const demoTranscript = [
  { t: "0:00", who: "agent" as const, text: "Hi, thanks for calling MyHomeQuote, this is Nora. Are you looking for a home insurance quote today?" },
  { t: "0:05", who: "caller" as const, text: "Yes, hi. My policy renews in May and the price went up a lot." },
  { t: "0:11", who: "agent" as const, text: "Sorry to hear that. Let’s see if we can find you something better. Can I get your name?" },
  { t: "0:15", who: "caller" as const, text: "Linda Carter." },
  { t: "0:18", who: "agent" as const, text: "Thanks, Linda. What’s the ZIP code of the home?" },
  { t: "0:22", who: "caller" as const, text: "78704." },
  { t: "0:25", who: "agent" as const, text: "Is it a single-family house, and do you own it?" },
  { t: "0:31", who: "caller" as const, text: "Single-family, and yes, I own it." },
  { t: "0:46", who: "agent" as const, text: "What’s the best email to send your quotes to?" },
  { t: "0:58", who: "caller" as const, text: "linda.carter@email.com" },
  { t: "1:10", who: "caller" as const, text: "Yes, mornings work best." },
  { t: "1:13", who: "agent" as const, text: "Perfect, you’re all set, Linda. Have a great day!" },
];

const demoFields = {
  full_name: { value: "Linda Carter" },
  phone: { value: "+1 512 555 0182" },
  email: { value: "linda.carter@email.com" },
  zip_code: { value: "78704" },
  home_type: { value: "Single-family, owner" },
  consent_to_contact: { value: true },
  best_time_to_call: { value: "Mornings" },
};

const demoQualification = {
  real_person: { result: "success" },
  wants_a_quote: { result: "success" },
  owns_the_home: { result: "success" },
  gave_contact_details: { result: "success" },
};

const demoSummary =
  "Linda owns a single-family home in Austin (78704). Her policy renews in May and the price went up, so she’s shopping around. She gave a working email and prefers a morning callback.";

// Base seeds (ts/when are filled in relative to now by getDemoLeads).
type Seed = Omit<Lead, "ts" | "when"> & { agoMinutes: number };

const seeds: Seed[] = [
  { id: "linda-carter", agoMinutes: 120, name: "Linda Carter", phone: "+1 512 555 0182", status: "Real", score: 87, intent: "Policy renewing, price went up", dur: "1:18", agent: "Nora", stage: "Contacted", assigneeId: "maya", clientId: "acme", source: "call", conversationId: "demo-linda", hasAudio: false, summary: demoSummary, transcript: demoTranscript, dataFields: demoFields, qualification: demoQualification },
  { id: "unknown-1", agoMinutes: 300, name: "Unknown caller", phone: "+1 213 555 0147", status: "Spam", score: 3, intent: "Robocall / silence", dur: "0:07", agent: "Bob", stage: "New", assigneeId: null, clientId: "acme", source: "call", conversationId: "demo-unknown1" },
  { id: "james-patel", agoMinutes: 1440, name: "James Patel", phone: "+1 469 555 0193", status: "Real", score: 92, intent: "Buying a home, closing soon", dur: "3:05", agent: "Nora", stage: "Quoted", assigneeId: "devin", clientId: "bluebird", source: "call", conversationId: "demo-james", hasAudio: false, summary: "James is buying a home closing next month and needs a new policy. Gave full details and consented to a callback.", transcript: demoTranscript, dataFields: { full_name: { value: "James Patel" }, zip_code: { value: "75201" }, consent_to_contact: { value: true } }, qualification: demoQualification },
  { id: "dale-cooper", agoMinutes: 2880, name: "Dale Cooper", phone: "+1 206 555 0110", status: "Unclear", score: 42, intent: "Asked about rates, hung up", dur: "0:47", agent: "Bob", stage: "New", assigneeId: null, clientId: "bluebird", source: "call", conversationId: "demo-dale" },
  { id: "rosa-jimenez", agoMinutes: 5760, name: "Rosa Jimenez", phone: "+1 305 555 0166", status: "Real", score: 79, intent: "Switching from current insurer", dur: "2:36", agent: "Nora", stage: "Contacted", assigneeId: "priya", clientId: "acme", source: "call", conversationId: "demo-rosa" },
  { id: "kevin-brooks", agoMinutes: 8640, name: "Kevin Brooks", phone: "+1 617 555 0121", status: "Spam", score: 8, intent: "Selling roofing leads", dur: "0:31", agent: "Nora", stage: "New", assigneeId: null, clientId: "bluebird", source: "call", conversationId: "demo-kevin" },
  { id: "angela-wu", agoMinutes: 14400, name: "Angela Wu", phone: "+1 415 555 0175", status: "Real", score: 83, intent: "Condo, needs HO-6 quote", dur: "2:58", agent: "Bob", stage: "New", assigneeId: "devin", clientId: "acme", source: "call", conversationId: "demo-angela" },
  { id: "tom-reyes", agoMinutes: 21600, name: "Tom Reyes", phone: "+1 702 555 0139", status: "Unclear", score: 55, intent: "Renter, asked about home policy", dur: "0:52", agent: "Bob", stage: "Lost", assigneeId: "priya", clientId: "bluebird", source: "call", conversationId: "demo-tom" },
  { id: "hannah-scott", agoMinutes: 28800, name: "Hannah Scott", phone: "+1 312 555 0104", status: "Real", score: 88, intent: "Bundle home and auto", dur: "4:20", agent: "Nora", stage: "Won", assigneeId: "maya", clientId: "acme", source: "call", conversationId: "demo-hannah" },
  { id: "silent-1", agoMinutes: 36000, name: "Silent caller", phone: "+1 646 555 0158", status: "Spam", score: 2, intent: "No response on the line", dur: "0:05", agent: "Bob", stage: "New", assigneeId: null, clientId: "bluebird", source: "call", conversationId: "demo-silent1" },
];

export function getDemoLeads(): Lead[] {
  const now = Date.now();
  return seeds.map(({ agoMinutes, ...s }) => {
    const d = new Date(now - agoMinutes * 60_000);
    return {
      ...s,
      ts: d.toISOString(),
      when: d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
    };
  });
}
