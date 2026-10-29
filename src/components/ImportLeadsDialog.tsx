"use client";

import { useEffect, useRef, useState } from "react";
import { CloseIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { useLeads } from "@/lib/leads-store";
import { clients, type Lead } from "@/lib/data";
import {
  leadsTemplateCsv,
  parseLeadsCsv,
  type ParseResult,
} from "@/lib/import-leads";

export function ImportLeadsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { addLeads } = useLeads();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<ParseResult | null>(null);

  // Reset the form each time the dialog opens.
  useEffect(() => {
    if (open) {
      setClientId(clients[0]?.id ?? "");
      setFileName("");
      setResult(null);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () =>
      setResult(parseLeadsCsv(String(reader.result ?? ""), clientId));
    reader.readAsText(file);
  };

  // Re-tag already-parsed rows if the client changes after a file was picked.
  const onClientChange = (id: string) => {
    setClientId(id);
    setResult((r) =>
      r ? { ...r, leads: r.leads.map((l) => ({ ...l, clientId: id })) } : r,
    );
  };

  const downloadTemplate = () => {
    const url = URL.createObjectURL(
      new Blob([leadsTemplateCsv()], { type: "text/csv" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const doImport = () => {
    if (!result || result.leads.length === 0) return;
    addLeads(result.leads);
    const n = result.leads.length;
    toast(`Imported ${n} lead${n === 1 ? "" : "s"}`);
    onClose();
  };

  const count = result?.leads.length ?? 0;
  const preview = result?.leads.slice(0, 5) ?? [];

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center p-4 pt-[10vh]">
      <div
        className="absolute inset-0 bg-ink/40 animate-[fade-in_120ms_ease-out]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Import leads"
        className="card relative flex max-h-[80vh] w-full max-w-xl flex-col overflow-hidden shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-hairline px-5 py-3.5">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-semibold">Import leads</h2>
            <p className="text-[13px] text-muted">
              Upload a client&rsquo;s leads from a CSV file.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-hover hover:text-ink"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 overflow-y-auto p-5">
          {/* Client */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="import-client" className="text-[13px] font-medium text-sub">
              Client
            </label>
            <Select
              id="import-client"
              value={clientId}
              onChange={(e) => onClientChange(e.target.value)}
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          {/* File */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-sub">CSV file</span>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              onChange={onFile}
              className="hidden"
            />
            <div className="flex items-center gap-3">
              <Button onClick={() => fileRef.current?.click()}>
                Choose CSV file
              </Button>
              <span className="min-w-0 truncate text-[13px] text-muted">
                {fileName || "No file selected"}
              </span>
            </div>
            <p className="text-xs text-muted2">
              Expected columns: Name, Phone, Status, Intent, Length, Agent,
              Stage, Owner, Date. Name and Phone are required.{" "}
              <button
                type="button"
                onClick={downloadTemplate}
                className="font-medium text-brand transition-colors hover:text-brand-hover"
              >
                Download template
              </button>
            </p>
          </div>

          {/* Preview / errors */}
          {result && (
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-x-2 text-sm">
                <span className="font-semibold">
                  {count} lead{count === 1 ? "" : "s"} ready to import
                </span>
                {result.skipped > 0 && (
                  <span className="text-bad-fg">
                    · {result.skipped} row{result.skipped === 1 ? "" : "s"}{" "}
                    skipped
                  </span>
                )}
              </div>

              {count > 0 && (
                <div className="overflow-hidden rounded-lg border border-border">
                  <div className="grid grid-cols-[1.4fr_1fr_0.8fr] gap-3 border-b border-hairline bg-hover px-3 py-2 text-xs font-semibold uppercase tracking-[0.04em] text-muted">
                    <span>Name</span>
                    <span>Phone</span>
                    <span>Status</span>
                  </div>
                  {preview.map((l: Lead) => (
                    <div
                      key={l.id}
                      className="grid grid-cols-[1.4fr_1fr_0.8fr] gap-3 border-b border-row px-3 py-2 text-sm last:border-b-0"
                    >
                      <span className="truncate font-medium">{l.name}</span>
                      <span className="truncate font-mono text-xs text-muted">
                        {l.phone}
                      </span>
                      <span className="text-sub">{l.status}</span>
                    </div>
                  ))}
                  {count > preview.length && (
                    <div className="px-3 py-2 text-xs text-muted">
                      + {count - preview.length} more…
                    </div>
                  )}
                </div>
              )}

              {result.errors.length > 0 && count === 0 && (
                <p className="text-[13px] text-bad-fg">{result.errors[0]}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-hairline px-5 py-3.5">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled={count === 0} onClick={doImport}>
            Import {count > 0 ? count : ""} lead{count === 1 ? "" : "s"}
          </Button>
        </div>
      </div>
    </div>
  );
}
