import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TeamForm from "@/components/teams/TeamForm";

export default function NewTeamPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/teams" className="inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-6 transition-colors">
        <ArrowLeft size={14} />
        Back to Teams
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">New Team</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Fill in the details below.</p>
      </div>

      <TeamForm />
    </div>
  );
}
