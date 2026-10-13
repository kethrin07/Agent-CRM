"use client";

import { Avatar } from "@/components/ui/Avatar";
import { StageBadge } from "@/components/ui/Badge";
import { useLeads } from "@/lib/leads-store";
import { stageOrder, team, teamById, type Stage } from "@/lib/data";

export function LeadLifecycle({ id }: { id: string }) {
  const { leads, setStage, setAssignee } = useLeads();
  const lead = leads.find((l) => l.id === id);
  if (!lead) return null;

  return (
    <section className="card flex flex-col gap-3.5 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Lifecycle</h2>
        <StageBadge stage={lead.stage} />
      </div>

      <label className="flex flex-col gap-1.5 text-[13px] font-medium">
        Stage
        <select
          value={lead.stage}
          onChange={(e) => setStage(lead.id, e.target.value as Stage)}
          className="min-h-11 rounded-lg border border-border-strong bg-card px-2.5 text-sm font-normal text-ink"
        >
          {stageOrder.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-[13px] font-medium">
        Owner
        <div className="flex items-center gap-2.5">
          <Avatar member={teamById(lead.assigneeId)} size={32} />
          <select
            value={lead.assigneeId ?? ""}
            onChange={(e) => setAssignee(lead.id, e.target.value || null)}
            className="min-h-11 flex-grow rounded-lg border border-border-strong bg-card px-2.5 text-sm font-normal text-ink"
          >
            <option value="">Unassigned</option>
            {team.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </label>
    </section>
  );
}
