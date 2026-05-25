"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, ExternalLink } from "lucide-react";
import DeleteButton from "@/components/creators/DeleteButton";
import NoteList from "@/components/NoteList";
import type { Creator } from "@/types/creator";
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

export default function CreatorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/creators/${id}/`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setCreator(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Creator not found.");
        setLoading(false);
      });
  }, [id]);

  async function handleAddNote(content: string) {
    const res = await fetch(`/api/creators/${id}/notes/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error("Failed to add note");
    const note = await res.json();
    setCreator((prev) => (prev ? { ...prev, notes: [...(prev.notes || []), note] } : prev));
  }

  async function handleEditNote(noteId: number, content: string) {
    const res = await fetch(`/api/creators/${id}/notes/${noteId}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error("Failed to edit note");
    const updated = await res.json();
    setCreator((prev) =>
      prev ? { ...prev, notes: (prev.notes || []).map((n) => (n.id === noteId ? updated : n)) } : prev
    );
  }

  async function handleDeleteNote(noteId: number) {
    const res = await fetch(`/api/creators/${id}/notes/${noteId}/`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete note");
    setCreator((prev) =>
      prev ? { ...prev, notes: (prev.notes || []).filter((n) => n.id !== noteId) } : prev
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">{error}</p>
        <Link href="/dashboard" className="mt-4 inline-block text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  if (loading || !creator) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">Loading...</p>
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

        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-5">
          <h2 className="text-sm font-semibold mb-3">Teams</h2>
          {creator.teams && creator.teams.length > 0 ? (
            <ul className="space-y-2">
              {creator.teams.map((team) => (
                <li key={team.id}>
                  <Link href={`/teams/${team.id}`} className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
                    {team.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Not part of any teams.</p>
          )}
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

          <NoteList
            notes={creator.notes || []}
            onAdd={handleAddNote}
            onEdit={handleEditNote}
            onDelete={handleDeleteNote}
          />
        </div>
      </div>
    </div>
  );
}
