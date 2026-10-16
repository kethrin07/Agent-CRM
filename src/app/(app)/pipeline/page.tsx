"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/Badge";
import { useLeadDrawer } from "@/components/LeadDrawer";
import { useLeads } from "@/lib/leads-store";
import {
  stageMeta,
  stageOrder,
  team,
  teamById,
  type Lead,
  type Stage,
} from "@/lib/data";

export default function PipelinePage() {
  const { leads, setStage, setAssignee } = useLeads();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<Stage | null>(null);

  // The pipeline is the human follow-up flow — spam never enters it.
  const pipeline = leads.filter((l) => l.status !== "Spam");
  const byStage = (stage: Stage) => pipeline.filter((l) => l.stage === stage);

  const active = pipeline.filter((l) =>
    ["New", "Contacted", "Quoted"].includes(l.stage),
  ).length;
  const won = byStage("Won").length;
  const unassigned = pipeline.filter(
    (l) => !l.assigneeId && !["Won", "Lost"].includes(l.stage),
  ).length;

  const drop = (stage: Stage) => {
    if (draggingId) setStage(draggingId, stage);
    setDraggingId(null);
    setDragOver(null);
  };

  const stats = [
    { label: "Active leads", value: active },
    { label: "Quoted", value: byStage("Quoted").length },
    { label: "Won", value: won },
    { label: "Unassigned", value: unassigned },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[26px] font-semibold tracking-[-0.02em]">Pipeline</h1>
          <div className="text-sm text-muted">
            Work real leads from first callback to closed. Drag a card to move it,
            or use the stage menu.
          </div>
        </div>
      </div>

      {/* Metrics strip */}
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
        {stats.map((s) => (
          <div key={s.label} className="card flex flex-col gap-1 px-4 py-3">
            <div className="text-xs text-muted">{s.label}</div>
            <div className="text-2xl font-semibold tracking-[-0.02em]">
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Board */}
      <div className="-mx-4 overflow-x-auto px-4 shell:-mx-10 shell:px-10">
        <div className="flex gap-4 pb-2">
          {stageOrder.map((stage) => {
            const meta = stageMeta[stage];
            const cards = byStage(stage);
            const over = dragOver === stage;
            return (
              <section
                key={stage}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(stage);
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget === e.target) setDragOver(null);
                }}
                onDrop={() => drop(stage)}
                className={`flex w-[280px] flex-shrink-0 flex-col gap-3 rounded-xl border p-3 transition-colors ${
                  over
                    ? "border-brand bg-brand-soft"
                    : "border-border bg-page"
                }`}
              >
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: meta.dot }}
                    />
                    {meta.label}
                  </div>
                  <span className="rounded-full bg-card px-2 py-0.5 text-xs font-medium text-muted">
                    {cards.length}
                  </span>
                </div>

                <div className="flex flex-col gap-2.5">
                  {cards.map((lead) => (
                    <PipelineCard
                      key={lead.id}
                      lead={lead}
                      dragging={draggingId === lead.id}
                      onDragStart={() => setDraggingId(lead.id)}
                      onDragEnd={() => {
                        setDraggingId(null);
                        setDragOver(null);
                      }}
                      onStage={(s) => setStage(lead.id, s)}
                      onAssignee={(a) => setAssignee(lead.id, a)}
                    />
                  ))}
                  {cards.length === 0 && (
                    <div className="rounded-lg border border-dashed border-dash px-3 py-6 text-center text-xs text-muted">
                      Drop leads here
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}

function PipelineCard({
  lead,
  dragging,
  onDragStart,
  onDragEnd,
  onStage,
  onAssignee,
}: {
  lead: Lead;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onStage: (stage: Stage) => void;
  onAssignee: (assigneeId: string | null) => void;
}) {
  const { open } = useLeadDrawer();
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`card flex cursor-grab flex-col gap-2 p-3 active:cursor-grabbing ${
        dragging ? "opacity-40" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/leads/${lead.id}`}
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)
              return;
            e.preventDefault();
            open(lead.id);
          }}
          className="text-sm font-semibold text-ink no-underline hover:text-brand"
        >
          {lead.name}
        </Link>
        <span className="font-mono text-xs text-muted">{lead.score}</span>
      </div>

      <div className="font-mono text-xs text-muted">{lead.phone}</div>
      <div className="line-clamp-2 text-[13px] text-sub">{lead.intent}</div>

      <div className="flex items-center gap-2">
        <StatusBadge status={lead.status} />
        <span className="text-xs text-muted">· {lead.agent}</span>
      </div>

      <div className="mt-1 flex items-center justify-between gap-2 border-t border-hairline pt-2.5">
        <div className="flex items-center gap-1.5">
          <Avatar member={teamById(lead.assigneeId)} size={22} />
          <select
            aria-label={`Assign ${lead.name}`}
            value={lead.assigneeId ?? ""}
            onChange={(e) => onAssignee(e.target.value || null)}
            className="max-w-[96px] rounded-md border border-border-strong bg-card px-1.5 py-1 text-xs text-ink"
          >
            <option value="">Unassigned</option>
            {team.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <select
          aria-label={`Move ${lead.name} to stage`}
          value={lead.stage}
          onChange={(e) => onStage(e.target.value as Stage)}
          className="rounded-md border border-border-strong bg-card px-1.5 py-1 text-xs font-medium text-ink"
        >
          {stageOrder.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
