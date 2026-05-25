"use client";

import { X, Plus } from "lucide-react";
import type { TagEntry } from "@/types/creator";

export default function TagsField({
  tags,
  onChange,
}: {
  tags: TagEntry[];
  onChange: (tags: TagEntry[]) => void;
}) {
  function add() {
    onChange([...tags, { id: null, key: "", value: "", uid: Date.now() }]);
  }

  function remove(uid: number) {
    onChange(tags.filter((t) => t.uid !== uid));
  }

  function update(uid: number, field: "key" | "value", val: string) {
    onChange(tags.map((t) => (t.uid === uid ? { ...t, [field]: val } : t)));
  }

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">Tags</label>
      <div className="space-y-2">
        {tags.map((tag) => (
          <div key={tag.uid} className="flex items-start gap-2">
            <input
              type="text"
              placeholder="Key"
              value={tag.key}
              onChange={(e) => update(tag.uid, "key", e.target.value)}
              className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
            />
            <input
              type="text"
              placeholder="Value (optional)"
              value={tag.value}
              onChange={(e) => update(tag.uid, "value", e.target.value)}
              className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={() => remove(tag.uid)}
              className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-2 inline-flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
      >
        <Plus size={14} />
        Add Tag
      </button>
    </div>
  );
}
