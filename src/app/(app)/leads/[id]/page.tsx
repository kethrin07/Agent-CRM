import Link from "next/link";
import { ChevronLeftIcon } from "@/components/icons";
import { LeadDetailView } from "@/components/LeadDetailView";

export default async function LeadDetailPage({
  params,
}: PageProps<"/leads/[id]">) {
  const { id } = await params;

  return (
    <>
      <Link
        href="/leads"
        className="flex min-h-8 items-center gap-1.5 self-start text-sm no-underline"
      >
        <ChevronLeftIcon />
        All leads
      </Link>

      <LeadDetailView id={id} />
    </>
  );
}
