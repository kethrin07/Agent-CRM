import type { Lead } from "./data";

/**
 * Demo dataset for DEMO MODE (NEXT_PUBLIC_DEMO_MODE=true). Lets the same codebase
 * run a polished mock version (no Supabase/ElevenLabs) for sales demos, while the
 * real deployment uses live data. Dates are generated relative to "now" so the
 * dashboard always has recent data across the 24h / 7d / 30d ranges.
 *
 * Theme matches the real product: AI agents qualifying inbound home-improvement
 * leads and matching homeowners with local contractors.
 */

const demoTranscript = [
  { t: "0:00", who: "agent" as const, text: "Hi, thanks for calling MyHomeQuote, this is Nora. What home project can I help with today?" },
  { t: "0:05", who: "caller" as const, text: "Hi, yeah — I need my roof replaced. It started leaking after the last storm." },
  { t: "0:11", who: "agent" as const, text: "Sorry to hear that. I can connect you with a local roofer. Can I get your name?" },
  { t: "0:15", who: "caller" as const, text: "Linda Carter." },
  { t: "0:18", who: "agent" as const, text: "Thanks, Linda. What’s the address of the property?" },
  { t: "0:22", who: "caller" as const, text: "412 Oak Street, Austin, 78704." },
  { t: "0:27", who: "agent" as const, text: "And do you own the home?" },
  { t: "0:31", who: "caller" as const, text: "Yes, I own it." },
  { t: "0:36", who: "agent" as const, text: "Roughly how big is the roof — how many stories?" },
  { t: "0:42", who: "caller" as const, text: "Single-story, about 1,800 square feet." },
  { t: "0:50", who: "agent" as const, text: "When are you hoping to get this done?" },
  { t: "0:54", who: "caller" as const, text: "As soon as possible, within a couple weeks." },
  { t: "1:02", who: "agent" as const, text: "Is it okay if a local roofer contacts you at this number?" },
  { t: "1:10", who: "caller" as const, text: "Yes, mornings work best." },
  { t: "1:13", who: "agent" as const, text: "Perfect, you’re all set, Linda. A local roofer will reach out. Have a great day!" },
];

const demoFields = {
  full_name: { value: "Linda Carter" },
  phone: { value: "+1 512 555 0182" },
  address: { value: "412 Oak Street, Austin, TX 78704" },
  trade: { value: "roofing" },
  project_summary: { value: "Roof replacement after storm damage" },
  ownership_status: { value: "owner" },
  rough_scope: { value: "~1,800 sq ft, single-story" },
  project_timeline: { value: "Within 2 weeks" },
  consent_given: { value: true },
  best_contact_time: { value: "Mornings" },
};

const demoQualification = {
  real_person: { result: "success" },
  has_project: { result: "success" },
  owns_the_home: { result: "success" },
  gave_contact_details: { result: "success" },
};

const demoSummary =
  "Linda owns a single-story home in Austin (78704). Her roof started leaking after a recent storm and she needs a full replacement within two weeks. She gave her address and phone and is happy for a local roofer to call her in the mornings.";

// Base seeds (ts/when are filled in relative to now by getDemoLeads).
type Seed = Omit<Lead, "ts" | "when"> & { agoMinutes: number };

const seeds: Seed[] = [
  { id: "linda-carter", agoMinutes: 120, name: "Linda Carter", phone: "+1 512 555 0182", status: "Real", score: 87, intent: "Roof leaking, needs replacement", dur: "1:18", agent: "Nora", stage: "Contacted", assigneeId: "maya", clientId: "acme", source: "call", conversationId: "demo-linda", hasAudio: false, summary: demoSummary, transcript: demoTranscript, dataFields: demoFields, qualification: demoQualification },
  { id: "unknown-1", agoMinutes: 300, name: "Unknown caller", phone: "+1 213 555 0147", status: "NoEngagement", score: 3, intent: "Silence, then hung up", dur: "0:07", agent: "Bob", stage: "New", assigneeId: null, clientId: "acme", source: "call", conversationId: "demo-unknown1" },
  { id: "james-patel", agoMinutes: 1440, name: "James Patel", phone: "+1 469 555 0193", status: "Real", score: 92, intent: "Kitchen remodel, starting soon", dur: "3:05", agent: "Nora", stage: "Quoted", assigneeId: "devin", clientId: "bluebird", source: "call", conversationId: "demo-james", hasAudio: false, summary: "James is remodeling his kitchen next month and wants a contractor to quote cabinets and countertops. Gave full details and consented to a callback.", transcript: demoTranscript, dataFields: { full_name: { value: "James Patel" }, address: { value: "88 Maple Ave, Dallas, TX 75201" }, trade: { value: "kitchen_bath" }, consent_given: { value: true } }, qualification: demoQualification },
  { id: "dale-cooper", agoMinutes: 2880, name: "Dale Cooper", phone: "+1 206 555 0110", status: "Unclear", score: 42, intent: "Asked about pricing, hung up", dur: "0:47", agent: "Bob", stage: "New", assigneeId: null, clientId: "bluebird", source: "call", conversationId: "demo-dale" },
  { id: "rosa-jimenez", agoMinutes: 5760, name: "Rosa Jimenez", phone: "+1 305 555 0166", status: "Real", score: 79, intent: "Bathroom renovation quote", dur: "2:36", agent: "Nora", stage: "Contacted", assigneeId: "priya", clientId: "acme", source: "call", conversationId: "demo-rosa" },
  { id: "kevin-brooks", agoMinutes: 8640, name: "Kevin Brooks", phone: "+1 617 555 0121", status: "Spam", score: 8, intent: "Selling roofing leads", dur: "0:31", agent: "Nora", stage: "New", assigneeId: null, clientId: "bluebird", source: "call", conversationId: "demo-kevin" },
  { id: "angela-wu", agoMinutes: 14400, name: "Angela Wu", phone: "+1 415 555 0175", status: "Real", score: 83, intent: "Wants new windows installed", dur: "2:58", agent: "Bob", stage: "New", assigneeId: "devin", clientId: "acme", source: "call", conversationId: "demo-angela" },
  { id: "tom-reyes", agoMinutes: 21600, name: "Tom Reyes", phone: "+1 702 555 0139", status: "Unclear", score: 55, intent: "Renter, asked about flooring", dur: "0:52", agent: "Bob", stage: "Lost", assigneeId: "priya", clientId: "bluebird", source: "call", conversationId: "demo-tom" },
  { id: "hannah-scott", agoMinutes: 28800, name: "Hannah Scott", phone: "+1 312 555 0104", status: "Real", score: 88, intent: "HVAC replacement + insulation", dur: "4:20", agent: "Nora", stage: "Won", assigneeId: "maya", clientId: "acme", source: "call", conversationId: "demo-hannah" },
  { id: "silent-1", agoMinutes: 36000, name: "Silent caller", phone: "+1 646 555 0158", status: "NoEngagement", score: 2, intent: "No response on the line", dur: "0:05", agent: "Bob", stage: "New", assigneeId: null, clientId: "bluebird", source: "call", conversationId: "demo-silent1" },
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
