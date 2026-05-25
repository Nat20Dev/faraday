"use client";

import { useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import type { Note } from "@/types/creator";

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

interface NoteListProps {
  notes: Note[];
  onAdd: (content: string) => Promise<void>;
  onEdit: (noteId: number, content: string) => Promise<void>;
  onDelete: (noteId: number) => Promise<void>;
}

export default function NoteList({ notes, onAdd, onEdit, onDelete }: NoteListProps) {
  const [newNote, setNewNote] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    if (!newNote.trim()) return;
    setAdding(true);
    setError(null);
    try {
      await onAdd(newNote.trim());
      setNewNote("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add note");
    } finally {
      setAdding(false);
    }
  }

  async function handleSaveEdit(noteId: number) {
    if (!editContent.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await onEdit(noteId, editContent.trim());
      setEditingId(null);
      setEditContent("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to edit note");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(note: Note) {
    setEditingId(note.id);
    setEditContent(note.content);
    setDeleteConfirmId(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditContent("");
  }

  async function handleDelete(noteId: number) {
    setSaving(true);
    setError(null);
    try {
      await onDelete(noteId);
      setDeleteConfirmId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete note");
    } finally {
      setSaving(false);
    }
  }

  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-5">
      <h2 className="text-sm font-semibold mb-3">Notes ({notes.length})</h2>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mb-3">{error}</p>
      )}

      {notes.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No notes yet.</p>
      ) : (
        <ul className="space-y-3">
          {sortedNotes.map((note) => (
            <li key={note.id} className="text-sm border-b border-zinc-100 dark:border-zinc-800 last:border-0 pb-3 last:pb-0">
              {editingId === note.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    rows={3}
                    disabled={saving}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(note.id)}
                      disabled={saving || !editContent.trim()}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                    >
                      <Check size={12} />
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={saving}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <X size={12} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-zinc-700 dark:text-zinc-300">{note.content}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-xs text-zinc-400" title={new Date(note.created_at).toLocaleString()}>
                      {timeAgo(note.created_at)}
                    </p>
                    <button
                      onClick={() => startEdit(note)}
                      className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                      aria-label="Edit note"
                    >
                      <Pencil size={12} />
                    </button>
                    {deleteConfirmId === note.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(note.id)}
                          disabled={saving}
                          className="text-xs text-red-600 dark:text-red-400 hover:underline"
                        >
                          {saving ? "Deleting..." : "Confirm"}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-xs text-zinc-400 hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(note.id)}
                        className="text-zinc-400 hover:text-red-500 transition-colors"
                        aria-label="Delete note"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 space-y-2">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note..."
          className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          rows={2}
          disabled={adding}
        />
        <button
          onClick={handleAdd}
          disabled={adding || !newNote.trim()}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {adding ? "Adding..." : "Add Note"}
        </button>
      </div>
    </div>
  );
}
