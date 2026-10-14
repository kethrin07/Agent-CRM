"use client";

import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useLeads } from "@/lib/leads-store";
import { team, teamById } from "@/lib/data";

export function LeadActions({ id }: { id: string }) {
  const { leads, setStage, setAssignee } = useLeads();
  const toast = useToast();
  const lead = leads.find((l) => l.id === id);
  if (!lead) return null;

  const markSpam = () => {
    const prev = lead.stage;
    setStage(id, "Lost");
    toast(`${lead.name} marked as spam`, {
      variant: "info",
      action: { label: "Undo", onClick: () => setStage(id, prev) },
    });
  };

  const callBack = () => {
    if (lead.stage === "New") {
      setStage(id, "Contacted");
      toast(`Calling ${lead.name} — moved to Contacted`);
    } else {
      toast(`Calling ${lead.name}…`, { variant: "info" });
    }
  };

  const assign = () => {
    if (lead.assigneeId) {
      toast(`Already assigned to ${teamById(lead.assigneeId)?.name}`, {
        variant: "info",
      });
      return;
    }
    const member = team[0];
    setAssignee(id, member.id);
    toast(`Assigned to ${member.name}`, {
      action: { label: "Undo", onClick: () => setAssignee(id, null) },
    });
  };

  return (
    <>
      <Button variant="danger" size="lg" onClick={markSpam}>
        Mark as spam
      </Button>
      <Button size="lg" onClick={assign}>
        Assign
      </Button>
      <Button variant="primary" size="lg" onClick={callBack}>
        Call back
      </Button>
    </>
  );
}

export function CopyTranscriptButton({ text }: { text: string }) {
  const toast = useToast();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast("Transcript copied to clipboard");
    } catch {
      toast("Couldn’t copy — check browser permissions", { variant: "error" });
    }
  };

  return (
    <Button size="sm" onClick={copy}>
      Copy transcript
    </Button>
  );
}
