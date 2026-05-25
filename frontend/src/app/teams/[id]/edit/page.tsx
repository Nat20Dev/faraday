import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TeamForm from "@/components/teams/TeamForm";
import type { Team } from "@/types/creator";

async function getTeam(id: string): Promise<Team> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/teams/${id}/`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Not found");
  return res.json();
}

export default async function EditTeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let team: Team | null = null;
  let error = false;

  try {
    team = await getTeam(id);
  } catch {
    error = true;
  }

  if (error || !team) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">Team not found.</p>
        <Link href="/teams" className="mt-4 inline-block text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
          ← Back to Teams
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link href={`/teams/${team.id}`} className="inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-6 transition-colors">
        <ArrowLeft size={14} />
        Back to {team.name}
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Edit Team</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Update the details below.</p>
      </div>

      <TeamForm team={team} />
    </div>
  );
}
