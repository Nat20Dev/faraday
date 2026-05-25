import Link from "next/link";
import { ArrowLeft, Pencil, ExternalLink, Plus, X } from "lucide-react";
import DeleteButton from "@/components/creators/DeleteButton";
import type { Creator } from "@/types/creator";

const SOURCE_LABELS: Record<string, string> = {
  MANUAL_ENTRY: "Manual Entry",
  EVENT: "Event",
  CAMPAIGN: "Campaign",
};

const SOURCE_STYLES: Record<string, string> = {
  MANUAL_ENTRY: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  EVENT: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  CAMPAIGN: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

const PLATFORM_EMOJIS: Record<string, string> = {
  INSTAGRAM: "📸",
  TIKTOK: "🎵",
  YOUTUBE: "▶️",
  TWITCH: "📺",
  BLUESKY: "🦋",
};

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

async function getCreator(id: string): Promise<Creator> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/creators/${id}/`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Not found");
  return res.json();
}

export default async function CreatorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let creator: Creator | null = null;
  let error: string | null = null;

  try {
    creator = await getCreator(id);
  } catch {
    error = "Creator not found.";
  }

  if (error || !creator) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">{error}</p>
        <Link href="/dashboard" className="mt-4 inline-block text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-6 transition-colors">
        <ArrowLeft size={14} />
        Back to Dashboard
      </Link>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight">{creator.name}</h1>
        <div className="flex items-center gap-2">
          <Link
            href={`/creators/${creator.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Pencil size={14} />
            Edit
          </Link>
          <DeleteButton creatorId={creator.id} creatorName={creator.name} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-5">
          <dl className="space-y-4">
            <div>
              <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Username</dt>
              <dd className="mt-0.5 text-sm">@{creator.username}</dd>
            </div>
            {creator.email && (
              <div>
                <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Email</dt>
                <dd className="mt-0.5 text-sm">
                  <a href={`mailto:${creator.email}`} className="text-emerald-600 dark:text-emerald-400 hover:underline">
                    {creator.email}
                  </a>
                </dd>
              </div>
            )}
            {creator.address && (
              <div>
                <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Address</dt>
                <dd className="mt-0.5 text-sm">{creator.address}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Source</dt>
              <dd className="mt-1">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${SOURCE_STYLES[creator.source]}`}>
                  {SOURCE_LABELS[creator.source]}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Created</dt>
              <dd className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400" title={new Date(creator.created_at).toLocaleString()}>
                {timeAgo(creator.created_at)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Updated</dt>
              <dd className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400" title={new Date(creator.updated_at).toLocaleString()}>
                {timeAgo(creator.updated_at)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-5">
            <h2 className="text-sm font-semibold mb-3">Social Links</h2>
            {creator.social_links.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No social links yet.</p>
            ) : (
              <ul className="space-y-2">
                {creator.social_links.map((link) => (
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
            {creator.tags && creator.tags.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No tags yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {creator.tags?.map((tag) => (
                  <span key={tag.id} className="inline-flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-xs font-medium">
                    {tag.key}{tag.value !== null ? `: ${tag.value}` : ""}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-5">
            <h2 className="text-sm font-semibold mb-3">Notes ({creator.notes?.length || 0})</h2>
            {creator.notes && creator.notes.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No notes yet.</p>
            ) : (
              <ul className="space-y-3">
                {creator.notes?.map((note) => (
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
