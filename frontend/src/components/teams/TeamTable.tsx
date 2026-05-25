"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus, Users } from "lucide-react";
import type { Team } from "@/types/creator";
import { PLATFORM_ICONS, SOURCE_STYLES } from "@/types/creator";

function SourceBadge({ source }: { source: string }) {
  const labels: Record<string, string> = {
    MANUAL_ENTRY: "Manual",
    EVENT: "Event",
    CAMPAIGN: "Campaign",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${SOURCE_STYLES[source] || SOURCE_STYLES.MANUAL_ENTRY}`}>
      {labels[source] || source}
    </span>
  );
}

function SocialIcons({ links }: { links: Team["social_links"] }) {
  if (links.length === 0) return <span className="text-xs text-zinc-400">—</span>;
  return (
    <div className="flex items-center gap-1.5">
      {links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm hover:scale-110 transition-transform"
          title={`${link.platform}: ${link.handle || link.url}`}
        >
          {PLATFORM_ICONS[link.platform] || "🔗"}
        </a>
      ))}
    </div>
  );
}

export default function TeamTable({ teams }: { teams: Team[] }) {
  const [search, setSearch] = useState("");

  const filtered = teams.filter((t) => {
    const q = search.toLowerCase();
    return t.name.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            aria-label="Search teams"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-colors"
          />
        </div>
        <Link
          href="/teams/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          <Plus size={16} />
          Add Team
        </Link>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-zinc-500 dark:text-zinc-400">
            {teams.length === 0
              ? "No teams yet. Create your first team to get started."
              : "No teams match your search."}
          </p>
          {teams.length === 0 && (
            <Link
              href="/teams/new"
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              <Plus size={16} />
              Add Team
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="hidden md:block rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                  <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-4 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-4 py-3">Source</th>
                  <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-4 py-3">Members</th>
                  <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-4 py-3">Social</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filtered.map((team) => (
                  <tr key={team.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/teams/${team.id}`} className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                        {team.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <SourceBadge source={team.source} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
                        <Users size={14} />
                        {team.member_count}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <SocialIcons links={team.social_links} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden flex flex-col gap-3">
            {filtered.map((team) => (
              <div
                key={team.id}
                className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Link href={`/teams/${team.id}`} className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                      {team.name}
                    </Link>
                  </div>
                  <SourceBadge source={team.source} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
                    <Users size={14} />
                    {team.member_count} {team.member_count === 1 ? "member" : "members"}
                  </span>
                  <SocialIcons links={team.social_links} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
