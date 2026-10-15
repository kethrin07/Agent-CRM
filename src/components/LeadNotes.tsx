"use client";

import { useLeads } from "@/lib/leads-store";

export function LeadNotes({ id }: { id: string }) {
  const { notes, setNote } = useLeads();
  const value = notes[id] ?? "";

  return (
    <label className="mt-1 flex flex-col gap-1.5 text-[13px] font-medium">
      <span className="flex items-center justify-between">
        Your notes
        {value.trim() && (
          <span className="text-xs font-normal text-muted">Saved</span>
        )}
      </span>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => setNote(id, e.target.value)}
        placeholder="Add a note for your team"
        className="resize-y rounded-lg border border-border-strong bg-card px-3 py-2.5 text-sm font-normal text-ink outline-none focus:border-brand"
      />
    </label>
  );
}
