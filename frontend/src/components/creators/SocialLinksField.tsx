"use client";

import { X, Plus } from "lucide-react";
import type { LinkEntry } from "@/types/creator";

const PLATFORMS = ["INSTAGRAM", "TIKTOK", "YOUTUBE", "TWITCH", "BLUESKY"];

export default function SocialLinksField({
  links,
  onChange,
}: {
  links: LinkEntry[];
  onChange: (links: LinkEntry[]) => void;
}) {
  function add() {
    onChange([...links, { id: null, platform: PLATFORMS[0], url: "", key: Date.now() }]);
  }

  function remove(key: number) {
    onChange(links.filter((l) => l.key !== key));
  }

  function update(key: number, field: "platform" | "url", value: string) {
    onChange(links.map((l) => (l.key === key ? { ...l, [field]: value } : l)));
  }

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">Social Links</label>
      <div className="space-y-2">
        {links.map((link) => (
          <div key={link.key} className="flex items-start gap-2">
            <select
              value={link.platform}
              onChange={(e) => update(link.key, "platform", e.target.value)}
              className="flex-shrink-0 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <input
              type="url"
              placeholder="https://..."
              value={link.url}
              onChange={(e) => update(link.key, "url", e.target.value)}
              className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={() => remove(link.key)}
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
        Add Social Link
      </button>
    </div>
  );
}
