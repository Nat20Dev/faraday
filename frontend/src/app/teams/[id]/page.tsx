import Link from "next/link";
import { ArrowLeft, Pencil, ExternalLink, Users } from "lucide-react";
import DeleteTeamButton from "@/components/teams/DeleteTeamButton";
import type { Team, Creator } from "@/types/creator";
import { SOURCE_LABELS, SOURCE_STYLES, PLATFORM_EMOJIS } from "@/types/creator";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

async function getTeam(id: string): Promise<Team> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/teams/${id}/`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Not found");
  return res.json();
}

async function getCreators(): Promise<Creator[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/creators/`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let team: Team | null = null;
  let error: string | null = null;
  let creatorMap = new Map<number, Creator>();

  try {
    team = await getTeam(id);
    const creators = await getCreators();
    for (const c of creators) {
      creatorMap.set(c.id, c);
    }
  } catch {
    error = "Team not found.";
  }

  if (error || !team) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">{error}</p>
        <Link href="/teams" className="mt-4 inline-block text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
          ← Back to Teams
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/teams" className="inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-6 transition-colors">
        <ArrowLeft size={14} />
        Back to Teams
      </Link>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight">{team.name}</h1>
        <div className="flex items-center gap-2">
          <Link
            href={`/teams/${team.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Pencil size={14} />
            Edit
          </Link>
          <DeleteTeamButton teamId={team.id} teamName={team.name} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-5">
          <dl className="space-y-4">
            {team.email && (
              <div>
                <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Email</dt>
                <dd className="mt-0.5 text-sm">
                  <a href={`mailto:${team.email}`} className="text-emerald-600 dark:text-emerald-400 hover:underline">
                    {team.email}
                  </a>
                </dd>
              </div>
            )}
            {team.address && (
              <div>
                <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Address</dt>
                <dd className="mt-0.5 text-sm">{team.address}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Source</dt>
              <dd className="mt-1">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${SOURCE_STYLES[team.source]}`}>
                  {SOURCE_LABELS[team.source]}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Created</dt>
              <dd className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400" title={new Date(team.created_at).toLocaleString()}>
                {timeAgo(team.created_at)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Updated</dt>
              <dd className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400" title={new Date(team.updated_at).toLocaleString()}>
                {timeAgo(team.updated_at)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-5">
            <h2 className="text-sm font-semibold mb-3">
              <span className="inline-flex items-center gap-1.5">
                <Users size={16} />
                Members ({team.member_count})
              </span>
            </h2>
            {team.members.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No members yet.</p>
            ) : (
              <ul className="space-y-2">
                {team.members.map((memberId) => {
                  const member = creatorMap.get(memberId);
                  return (
                    <li key={memberId}>
                      <Link
                        href={`/creators/${memberId}`}
                        className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        {member ? member.name : `Creator #${memberId}`}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-5">
            <h2 className="text-sm font-semibold mb-3">Social Links</h2>
            {team.social_links.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No social links yet.</p>
            ) : (
              <ul className="space-y-2">
                {team.social_links.map((link) => (
                  <li key={link.id} className="flex items-center gap-3 text-sm">
                    <span>{PLATFORM_EMOJIS[link.platform] || "🔗"}</span>
                    <span className="font-medium text-zinc-500 dark:text-zinc-400 min-w-[5rem]">{link.platform}</span>
                    {link.handle && <span className="text-zinc-700 dark:text-zinc-300">{link.handle}</span>}
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="ml-auto text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
                      <ExternalLink size={14} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-5">
            <h2 className="text-sm font-semibold mb-3">Tags</h2>
            {team.tags && team.tags.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No tags yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {team.tags?.map((tag) => (
                  <span key={tag.id} className="inline-flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-xs font-medium">
                    {tag.key}{tag.value !== null ? `: ${tag.value}` : ""}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-5">
            <h2 className="text-sm font-semibold mb-3">Notes ({team.notes?.length || 0})</h2>
            {team.notes && team.notes.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No notes yet.</p>
            ) : (
              <ul className="space-y-3">
                {team.notes?.map((note) => (
                  <li key={note.id} className="text-sm border-b border-zinc-100 dark:border-zinc-800 last:border-0 pb-3 last:pb-0">
                    <p className="text-zinc-700 dark:text-zinc-300">{note.content}</p>
                    <p className="mt-1 text-xs text-zinc-400" title={new Date(note.created_at).toLocaleString()}>
                      {timeAgo(note.created_at)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
