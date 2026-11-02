import { team, type Lead, type Stage, type Status } from "./data";

/**
 * Client-side CSV import for leads. Mirrors the column format produced by the
 * "Export CSV" button on the leads page (Name, Phone, Status, Intent, Length,
 * Agent, Stage, Owner, Date). Pure — no React, no backend.
 */

/** Quote/escape/newline-aware CSV parser → rows of string cells. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  // Strip a leading UTF-8 BOM (Excel/Sheets add it) + normalise newlines.
  const s = text.replace(/^﻿/, "").replace(/\r\n?/g, "\n");

  // Auto-detect the delimiter from the first line, so files exported with
  // semicolons (common in some locales) or tabs still parse.
  const firstLine = s.split("\n", 1)[0] ?? "";
  const countOf = (ch: string) => firstLine.split(ch).length - 1;
  const delim =
    countOf(";") > countOf(",") && countOf(";") >= countOf("\t")
      ? ";"
      : countOf("\t") > countOf(",")
        ? "\t"
        : ",";

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === delim) {
      row.push(cell);
      cell = "";
    } else if (c === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += c;
    }
  }
  // Flush the last cell/row if the file didn't end with a newline.
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  // Drop fully-empty rows (trailing blank lines).
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

const STATUSES: Status[] = ["Real", "Unclear", "Spam"];
const STAGES: Stage[] = ["New", "Contacted", "Quoted", "Won", "Lost"];

const norm = (s: string) => s.trim().toLowerCase();

function slugify(name: string): string {
  return (
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") ||
    "lead"
  );
}

export type ParseResult = {
  leads: Lead[];
  skipped: number;
  errors: string[];
};

/**
 * Map a CSV string into leads tagged to `clientId`. Rows missing Name or Phone
 * are skipped and reported; unknown enum values fall back to sane defaults.
 */
export function parseLeadsCsv(text: string, clientId: string): ParseResult {
  // .numbers / .xlsx files are zipped binaries (they start with "PK"), not text.
  if (text.startsWith("PK") || text.includes("Document.iwa")) {
    return {
      leads: [],
      skipped: 0,
      errors: [
        "This looks like a spreadsheet file (.numbers or .xlsx), not a CSV. " +
          "In your spreadsheet app use File → Export (or Save As) → CSV, then upload that .csv file.",
      ],
    };
  }

  const rows = parseCsv(text);
  const errors: string[] = [];
  if (rows.length < 2) {
    return {
      leads: [],
      skipped: 0,
      errors: ["The file has no data rows (expected a header + at least one row)."],
    };
  }

  const header = rows[0].map(norm);
  const col = (name: string) => header.indexOf(name);
  const idx = {
    name: col("name"),
    phone: col("phone"),
    status: col("status"),
    intent: col("intent"),
    length: col("length"),
    agent: col("agent"),
    stage: col("stage"),
    owner: col("owner"),
    date: col("date"),
  };

  if (idx.name === -1 || idx.phone === -1) {
    return {
      leads: [],
      skipped: 0,
      errors: [
        `Missing required columns: a "Name" and "Phone" header are required. ` +
          `Found: ${rows[0].join(", ") || "(none)"}.`,
      ],
    };
  }

  const at = (r: string[], i: number) => (i >= 0 ? (r[i] ?? "").trim() : "");
  const leads: Lead[] = [];
  let skipped = 0;
  const stamp = Date.now();

  rows.slice(1).forEach((r, i) => {
    const name = at(r, idx.name);
    const phone = at(r, idx.phone);
    if (!name || !phone) {
      skipped++;
      errors.push(`Row ${i + 2}: skipped (missing name or phone).`);
      return;
    }

    const rawStatus = at(r, idx.status);
    const status =
      STATUSES.find((s) => norm(s) === norm(rawStatus)) ?? "Real";

    const rawStage = at(r, idx.stage);
    const stage = STAGES.find((s) => norm(s) === norm(rawStage)) ?? "New";

    const rawAgent = at(r, idx.agent);
    const agent: Lead["agent"] =
      norm(rawAgent) === "nora"
        ? "Nora"
        : norm(rawAgent) === "bob"
          ? "Bob"
          : "Imported";

    const owner = at(r, idx.owner);
    const assigneeId =
      team.find((m) => norm(m.name) === norm(owner))?.id ?? null;

    const rawDate = at(r, idx.date);
    const parsed = rawDate ? new Date(rawDate) : null;
    const when =
      parsed && !Number.isNaN(parsed.getTime()) ? parsed : new Date();

    leads.push({
      id: `imp-${stamp}-${i}-${slugify(name)}`,
      name,
      phone,
      status,
      score: 0,
      intent: at(r, idx.intent),
      dur: at(r, idx.length) || "0:00",
      agent,
      ts: when.toISOString(),
      when: when.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      stage,
      assigneeId,
      clientId,
    });
  });

  return { leads, skipped, errors };
}

/** Header-only template (plus one example row) for the "Download template" link. */
export function leadsTemplateCsv(): string {
  const headers = [
    "Name",
    "Phone",
    "Status",
    "Intent",
    "Length",
    "Agent",
    "Stage",
    "Owner",
    "Date",
  ];
  const example = [
    "Jane Doe",
    "+1 555 010 0000",
    "Real",
    "Wants a home insurance quote",
    "0:00",
    "Imported",
    "New",
    "",
    "2026-10-29",
  ];
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return [headers.map(esc).join(","), example.map(esc).join(",")].join("\n");
}
