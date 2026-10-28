# Integration Plan: Supabase + ElevenLabs

Status: **Planned** · Last updated: 2026-10-28

This plan wires the Milvado55 CRM off mock data onto real services. It builds on
the integration scaffold that already exists (`src/lib/env.ts`,
`src/lib/integrations/*`, and the `/api/leads`, `/api/webhooks/elevenlabs`,
`/api/agents/[id]` routes).

## Decisions (confirmed)

- **Lifecycle data (stage, assignee, notes) → Supabase** — team-shared, one
  source of truth across users/devices (not browser localStorage).
- **Backfill + go-forward** — import existing call history via ElevenLabs
  `listConversations()`, and keep new calls flowing in via the post-call webhook.
- **Keep the mock role gate for now** — real Supabase Auth is a later phase.

## What already exists (scaffold)

- `src/lib/env.ts` — lazy, non-throwing env access + `isConfigured()` /
  `requireEnv()`.
- `src/lib/integrations/elevenlabs.ts` — fetch-based client:
  `listConversations`, `getConversation`, `getConversationAudio`, `updateAgent`,
  `verifyWebhookSignature` (HMAC), `agentIdFor`.
- `src/lib/integrations/supabase.ts` — lazy service-role admin client,
  `LEADS_TABLE`.
- `src/lib/integrations/map.ts` — `conversationToLead()` mapper.
- API routes: `GET /api/leads`, `POST /api/webhooks/elevenlabs`,
  `PATCH /api/agents/[id]` (all graceful when unconfigured).
- `.env.local` (gitignored) + `.env.example` (committed).

## Phase 1 — Supabase schema

Create `supabase/migrations/0001_leads.sql` with a single `leads` table holding
both the call record and the lifecycle state.

| column | type | source |
|---|---|---|
| `conversation_id` | text **PK** | ElevenLabs (natural key) |
| `id` | text unique | display slug |
| `name`, `phone`, `status`, `score`, `intent`, `dur`, `agent`, `ts`, `when` | — | existing `Lead` fields |
| `summary` | text | `transcript_summary` |
| `duration_secs` | int | metadata |
| `transcript` | jsonb | `[{ t, who, text }]` |
| `data_fields` | jsonb | `data_collection_results` |
| `qualification` | jsonb | `evaluation_criteria_results` |
| `has_audio` | bool | ElevenLabs |
| `stage`, `assignee_id`, `note` | — | lifecycle (team-shared) |
| `created_at`, `updated_at` | timestamptz | defaults |

- **RLS enabled, no anon policies.** All access is server-side via the
  service-role key (bypasses RLS). No browser Supabase client, so secrets never
  ship to the client.
- Switching the upsert conflict target to `conversation_id` fixes a latent bug:
  the current `map.ts` keys leads by name-slug, so two people with the same name
  would collide.

## Phase 2 — ElevenLabs ingestion (go-forward + backfill)

- **Extend `map.ts`** so `conversationToLead()` also returns `conversation_id`,
  `summary`, `duration_secs`, `transcript` (mapped from `transcript[]`),
  `data_fields`, `qualification`, and `has_audio`.
- **Webhook** (`/api/webhooks/elevenlabs`) — already verifies HMAC + upserts;
  change `onConflict` to `conversation_id` and persist the richer row.
- **Backfill** — new `POST /api/sync` (guarded) + `npm run sync` script that
  pages through `listConversations()` and upserts each. One-time history import.
- **Audio** — new `GET /api/leads/[id]/audio` that proxies
  `getConversationAudio()` (keeps `xi-api-key` server-side); the recording player
  points here instead of a mock file. No audio bytes duplicated into Supabase.

## Phase 3 — Wire the UI off mock data

- Make the `(app)` layout (or a small server wrapper) fetch leads from Supabase
  when `isConfigured("supabase")`, else fall back to the current mock array — so
  dev still works keyless.
- **`LeadsStoreProvider`** takes `initialLeads` as a prop instead of seeding from
  mock. Lifecycle writes (`setStage` / `setAssignee` / `setNote`) become
  **optimistic UI → `PATCH /api/leads/[id]`** (new route) instead of
  localStorage.
- **`LeadDetailView`** reads `transcript` / `data_fields` / `qualification` from
  the selected lead instead of the single hardcoded mock; the `Lead` type gains
  these optional fields.

## Phase 4 — Config & verification

- Fill `.env.local`: `ELEVENLABS_API_KEY`, `ELEVENLABS_WEBHOOK_SECRET`,
  `ELEVENLABS_AGENT_ID_NORA` / `_BOB`, `NEXT_PUBLIC_SUPABASE_URL`,
  `SUPABASE_SERVICE_ROLE_KEY` (+ anon). Point the ElevenLabs post-call webhook at
  `/api/webhooks/elevenlabs`.
- Verify:
  1. `npm run build` passes.
  2. Run the migration in Supabase.
  3. `npm run sync` imports history.
  4. A test call lands via the webhook.
  5. UI shows real leads, transcript, and plays audio.
  6. Stage/assignee/note changes persist in Supabase and survive a reload on
     another device.

## Out of scope (noted for later)

- **Live calls stay simulated** — real live transcript needs an ElevenLabs
  WebSocket stream; the current component is built to swap in later. Optional
  interim: poll `listConversations` for in-progress calls to drive "Live now".
- **Real auth** — keeping the mock role gate; Supabase Auth is a future phase.
- `updateAgent` route stays available but unused (the agent-settings UI was
  removed earlier).

## Open questions

- Include the interim **"Live now" via `listConversations` polling** now, or
  leave live calls fully simulated this phase?
- Scaffold the migration for the **Supabase CLI** (`supabase/migrations/`), or
  hand off a plain `.sql` to paste into the dashboard SQL editor?
