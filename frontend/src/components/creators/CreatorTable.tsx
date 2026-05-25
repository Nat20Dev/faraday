"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus } from "lucide-react";
import type { Creator } from "@/types/creator";
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

function SocialIcons({ links }: { links: Creator["social_links"] }) {
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

export default function CreatorTable({ creators }: { creators: Creator[] }) {
  const [search, setSearch] = useState("");

  const filtered = creators.filter((c) => {
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.username.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-colors"
          />
        </div>
        <Link
          href="/creators/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          <Plus size={16} />
          Add Creator
        </Link>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-zinc-500 dark:text-zinc-400">
            {creators.length === 0
              ? "No creators yet. Add your first creator to get started."
              : "No creators match your search."}
          </p>
          {creators.length === 0 && (
            <Link
              href="/creators/new"
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              <Plus size={16} />
              Add Creator
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
                  <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-4 py-3">Username</th>
                  <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Email</th>
                  <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-4 py-3">Source</th>
                  <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-4 py-3">Social</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filtered.map((creator) => (
                  <tr key={creator.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/creators/${creator.id}`} className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                        {creator.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">@{creator.username}</td>
                    <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400 hidden sm:table-cell">
                      {creator.email || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <SourceBadge source={creator.source} />
                    </td>
                    <td className="px-4 py-3">
                      <SocialIcons links={creator.social_links} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden flex flex-col gap-3">
            {filtered.map((creator) => (
              <div
                key={creator.id}
                className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Link href={`/creators/${creator.id}`} className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                      {creator.name}
                    </Link>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">@{creator.username}</div>
                  </div>
                  <SourceBadge source={creator.source} />
                </div>
                {creator.email && (
                  <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">{creator.email}</div>
                )}
                <SocialIcons links={creator.social_links} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
