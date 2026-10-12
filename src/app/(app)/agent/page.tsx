"use client";

import { useState } from "react";
import { PhoneIcon, PlayIcon, TrashIcon } from "@/components/icons";
import {
  agentConfigs,
  collectFields,
  defaultVoice,
  knowledgeBase,
  qualificationRules,
  voiceLibrary,
} from "@/lib/data";

type AgentName = "Nora" | "Bob";

const sliders = [
  { label: "Stability", value: "0.50", min: 0, max: 100, def: 50 },
  { label: "Similarity", value: "0.75", min: 0, max: 100, def: 75 },
  { label: "Speed", value: "1.00×", min: 70, max: 120, def: 100 },
];

export default function AgentSettingsPage() {
  const [agent, setAgent] = useState<AgentName>("Nora");
  const [voice, setVoice] = useState<Record<AgentName, string>>(defaultVoice);

  const cur = agentConfigs[agent];
  const picked = voice[agent];

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[26px] font-semibold tracking-[-0.02em]">
            Agent settings
          </h1>
          <div className="text-sm text-muted">
            Inbound only · Changes sync to ElevenLabs when you publish
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="flex min-h-11 items-center gap-2 rounded-lg border border-border-strong bg-card px-4 text-sm text-ink"
          >
            <PhoneIcon />
            Test call with {cur.name}
          </button>
          <button
            type="button"
            className="min-h-11 rounded-lg bg-brand px-[18px] text-sm font-semibold text-white"
          >
            Publish changes
          </button>
        </div>
      </div>

      {/* Agent tabs */}
      <div role="tablist" aria-label="Agents" className="flex flex-wrap gap-3">
        {(Object.keys(agentConfigs) as AgentName[]).map((name) => {
          const a = agentConfigs[name];
          const on = name === agent;
          return (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setAgent(name)}
              className={`flex min-w-[240px] cursor-pointer items-center gap-3 rounded-xl bg-card py-2.5 pl-2.5 pr-4 text-left text-ink ${
                on ? "border-2 border-brand" : "border border-border"
              }`}
            >
              <span
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-semibold"
                style={{ background: a.avBg, color: a.avFg }}
              >
                {a.initial}
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-[15px] font-semibold">{a.name}</span>
                <span className="text-xs text-muted">
                  {a.role} · {a.number}
                </span>
              </span>
            </button>
          );
        })}
        <button
          type="button"
          className="min-h-[60px] rounded-xl border border-dashed bg-transparent px-4 text-sm text-sub"
          style={{ borderColor: "#B9B9B1" }}
        >
          New agent
        </button>
      </div>

      {/* Two columns */}
      <div className="grid items-start gap-5 shell:[grid-template-columns:minmax(0,1.45fr)_minmax(0,1fr)]">
        {/* Left column */}
        <div className="flex flex-col gap-5">
          {/* Voice */}
          <section className="flex flex-col gap-[18px] rounded-xl border border-border bg-card p-5">
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-semibold">{cur.name}&apos;s voice</h2>
              <div className="text-[13px] text-muted">
                Pick from your ElevenLabs voice library, or paste a voice ID
              </div>
            </div>
            <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(190px,1fr))]">
              {voiceLibrary.map((v) => {
                const on = v.name === picked;
                return (
                  <div
                    key={v.name}
                    className={`flex items-center gap-3 rounded-[10px] p-3 ${
                      on
                        ? "border-2 border-brand bg-brand-soft2"
                        : "border border-border bg-card"
                    }`}
                  >
                    <button
                      type="button"
                      aria-label={`Play sample of ${v.name}`}
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-border-strong bg-card text-brand"
                    >
                      <PlayIcon size={14} />
                    </button>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        setVoice((prev) => ({ ...prev, [agent]: v.name }))
                      }
                      className="flex min-h-11 flex-grow cursor-pointer flex-col justify-center gap-0.5 border-none bg-transparent py-1 text-left text-ink"
                    >
                      <span className="text-sm font-semibold">{v.name}</span>
                      <span className="text-xs text-muted">{v.desc}</span>
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-3 gap-5">
              {sliders.map((s) => (
                <label key={s.label} className="flex flex-col gap-2 text-[13px] font-medium">
                  <span className="flex justify-between">
                    {s.label}
                    <span className="font-mono font-normal text-muted">{s.value}</span>
                  </span>
                  <input
                    type="range"
                    min={s.min}
                    max={s.max}
                    defaultValue={s.def}
                    className="w-full [accent-color:var(--color-brand)]"
                  />
                </label>
              ))}
            </div>
          </section>

          {/* Conversation */}
          <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
            <h2 className="text-base font-semibold">Conversation</h2>
            <div className="grid grid-cols-2 gap-3.5">
              <label className="flex flex-col gap-1.5 text-[13px] font-medium">
                Language
                <select className="min-h-11 rounded-lg border border-border-strong bg-card px-2.5 text-sm font-normal text-ink">
                  <option>English (US)</option>
                  <option>Spanish</option>
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-[13px] font-medium">
                LLM
                <select className="min-h-11 rounded-lg border border-border-strong bg-card px-2.5 text-sm font-normal text-ink">
                  <option>[CHOOSE MODEL]</option>
                </select>
              </label>
            </div>
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-[13px] font-medium">
                First message
                <input
                  key={`${agent}-first`}
                  type="text"
                  defaultValue={cur.first}
                  className="min-h-11 rounded-lg border border-border-strong px-3 text-sm font-normal text-ink outline-none"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-[13px] font-medium">
                System prompt
                <textarea
                  key={`${agent}-prompt`}
                  rows={10}
                  defaultValue={cur.prompt}
                  className="resize-y rounded-lg border border-border-strong p-3 font-mono text-[13px] leading-relaxed text-ink outline-none"
                />
              </label>
            </div>
          </section>

          {/* Knowledge base */}
          <section className="flex flex-col gap-3.5 rounded-xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold">Knowledge base</h2>
                <div className="text-[13px] text-muted">Shared by Nora and Bob</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Upload file", "Add URL", "Add text"].map((b) => (
                  <button
                    key={b}
                    type="button"
                    className="min-h-10 rounded-lg border border-border-strong bg-card px-3 text-[13px] text-ink"
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col overflow-hidden rounded-[10px] border border-hairline">
              {knowledgeBase.map((d) => (
                <div
                  key={d.name}
                  className="flex items-center gap-3 border-b border-row px-3.5 py-3 last:border-b-0"
                >
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-rowline font-mono text-[10px] font-medium text-sub">
                    {d.type}
                  </span>
                  <div className="flex min-w-0 flex-grow flex-col gap-0.5">
                    <span className="text-sm font-medium [overflow-wrap:anywhere]">
                      {d.name}
                    </span>
                    <span className="text-xs text-muted">{d.meta}</span>
                  </div>
                  <span className="rounded-full bg-good-bg px-2 py-[3px] text-[11px] font-semibold text-good-fg">
                    Indexed
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove ${d.name}`}
                    className="flex h-9 w-9 items-center justify-center rounded-md bg-transparent text-muted"
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          {/* Qualification rules */}
          <section className="flex flex-col gap-3.5 rounded-xl border border-border bg-card p-5">
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-semibold">Is it a real lead?</h2>
              <div className="text-[13px] text-muted">
                Every inbound call is graded against these rules
              </div>
            </div>
            {qualificationRules.map((r) => (
              <label
                key={r.label}
                className="flex min-h-7 items-start gap-2.5 text-sm leading-snug"
              >
                <input
                  type="checkbox"
                  defaultChecked={r.on}
                  className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 [accent-color:var(--color-brand)]"
                />
                <span>{r.label}</span>
              </label>
            ))}
            <label className="flex flex-col gap-1.5 border-t border-hairline pt-3.5 text-[13px] font-medium">
              Mark as Real lead when
              <select className="min-h-11 rounded-lg border border-border-strong bg-card px-2.5 text-sm font-normal text-ink">
                <option>All checked rules pass</option>
                <option>Score is 70 or higher</option>
              </select>
            </label>
            <button
              type="button"
              className="min-h-10 self-start rounded-lg border border-dashed bg-card px-3 text-[13px] text-ink"
              style={{ borderColor: "#B9B9B1" }}
            >
              Add rule
            </button>
          </section>

          {/* Details to collect */}
          <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-semibold">Details to collect</h2>
              <div className="text-[13px] text-muted">Saved as columns on each lead</div>
            </div>
            <div className="flex flex-col">
              {collectFields.map((f) => (
                <div
                  key={f.key}
                  className="flex items-center justify-between border-b border-row py-[9px] text-[13px] last:border-b-0"
                >
                  <span className="font-mono">{f.key}</span>
                  <span className="text-muted">{f.type}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="min-h-10 self-start rounded-lg border border-dashed bg-card px-3 text-[13px] text-ink"
              style={{ borderColor: "#B9B9B1" }}
            >
              Add field
            </button>
          </section>

          {/* Connections */}
          <section className="flex flex-col gap-3.5 rounded-xl border border-border bg-card p-5">
            <h2 className="text-base font-semibold">{cur.name}&apos;s connections</h2>
            <div className="flex flex-col gap-2.5 text-[13px]">
              <div className="flex justify-between gap-3">
                <span className="text-muted">Inbound number</span>
                <span className="font-mono">{cur.number}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted">Answers</span>
                <span>{cur.hours}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted">ElevenLabs agent ID</span>
                <span className="font-mono">{cur.agentId}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted">Supabase table</span>
                <span className="font-mono">public.leads</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 text-[13px]">
              <span className="font-medium">Post-call webhook (shared)</span>
              <div className="rounded-lg bg-page px-3 py-2.5 font-mono text-xs text-sub [overflow-wrap:anywhere]">
                https://[PROJECT].supabase.co/functions/v1/elevenlabs-webhook
              </div>
              <span className="flex items-center gap-1.5 text-xs text-good-fg">
                <span className="h-2 w-2 rounded-full bg-good" />
                Last event received 3 min ago
              </span>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
