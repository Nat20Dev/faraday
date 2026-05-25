import TeamTable from "@/components/teams/TeamTable";
import type { Team } from "@/types/creator";

async function getTeams(): Promise<Team[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/teams/`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load teams");
  return res.json();
}

export default async function TeamsPage() {
  let teams: Team[] = [];
  let error: string | null = null;

  try {
    teams = await getTeams();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load teams";
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Teams</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {teams.length} {teams.length === 1 ? "team" : "teams"} tracked
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 p-4 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      ) : (
        <TeamTable teams={teams} />
      )}
    </div>
  );
}
