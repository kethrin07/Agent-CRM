-- Milvado55 CRM — leads table
--
-- Written by the ElevenLabs post-call webhook (service role) via
-- src/app/api/webhooks/elevenlabs/route.ts, and read by src/app/api/leads/route.ts.
-- Column names intentionally match the keys of the Lead object the app upserts
-- (src/lib/integrations/map.ts → conversationToLead), so no code changes are
-- needed to start writing data. camelCase columns are quoted to preserve case.
--
-- Run this in the Supabase SQL editor (or `supabase db push` with the CLI).

create table if not exists public.leads (
  id             text primary key,          -- app lead id; webhook upsert conflict target
  name           text not null,
  phone          text,
  status         text check (status in ('Real','Unclear','Spam')),
  score          integer default 0,
  intent         text default '',
  dur            text default '0:00',        -- human mm:ss
  agent          text,                        -- 'Nora' | 'Bob' | 'Imported'
  ts             text,                        -- ISO timestamp string (sorts lexically)
  "when"         text,                        -- human display string ("when" is reserved → quoted)
  stage          text default 'New'
                 check (stage in ('New','Contacted','Quoted','Won','Lost')),
  "assigneeId"   text,                        -- team member id, nullable
  "clientId"     text,                        -- tenant/client id, nullable

  -- Enrichment: populated in a later phase. Nullable, so the current webhook
  -- (which doesn't set these yet) inserts fine. Here now to avoid a 2nd migration.
  "conversationId" text unique,
  summary          text,
  "durationSecs"   integer,
  transcript       jsonb,
  "dataFields"     jsonb,
  qualification    jsonb,
  "hasAudio"       boolean,
  source           text,                        -- 'call' | 'backfill' | 'import' | 'test' (for clean deletes)

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists leads_ts_idx on public.leads (ts desc);
create index if not exists leads_client_idx on public.leads ("clientId");
create index if not exists leads_status_idx on public.leads (status);

-- Keep updated_at fresh on every row update.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

-- Lock the table down. The app connects only with the service_role key
-- (server-only), which bypasses RLS. Enabling RLS with no policies makes the
-- table unreachable from the browser / anon key.
alter table public.leads enable row level security;
