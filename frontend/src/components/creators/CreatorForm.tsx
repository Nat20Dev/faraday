"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SocialLinksField from "./SocialLinksField";
import TagsField from "./TagsField";
import type { Creator, LinkEntry, TagEntry } from "@/types/creator";

interface FormData {
  name: string;
  username: string;
  email: string;
  address: string;
  source: string;
}

interface Errors {
  name?: string;
  username?: string;
  email?: string;
  source?: string;
  general?: string;
}

export default function CreatorForm({ creator }: { creator?: Creator }) {
  const isEdit = !!creator;
  const router = useRouter();

  const [form, setForm] = useState<FormData>({
    name: creator?.name || "",
    username: creator?.username || "",
    email: creator?.email || "",
    address: creator?.address || "",
    source: creator?.source || "MANUAL_ENTRY",
  });

  const [socialLinks, setSocialLinks] = useState<LinkEntry[]>(
    creator?.social_links?.map((l) => ({ id: l.id, platform: l.platform, url: l.url, key: l.id })) || []
  );

  const [tags, setTags] = useState<TagEntry[]>(
    creator?.tags?.map((t) => ({ id: t.id, key: t.key, value: t.value || "", uid: t.id })) || []
  );

  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const e: Errors = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.username.trim()) e.username = "Username is required.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Please enter a valid email address.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setErrors({});

    try {
      const url = isEdit ? `/api/creators/${creator.id}/` : "/api/creators/";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          username: form.username.trim(),
          email: form.email.trim() || null,
          address: form.address.trim() || null,
          source: form.source,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (typeof data === "object") {
          const apiErrors: Errors = {};
          for (const [key, msgs] of Object.entries(data)) {
            if (key === "username" || key === "email" || key === "name" || key === "source") {
              apiErrors[key] = Array.isArray(msgs) ? msgs[0] : String(msgs);
            }
          }
          setErrors(Object.keys(apiErrors).length > 0 ? apiErrors : { general: "Failed to save creator." });
        } else {
          setErrors({ general: "Failed to save creator." });
        }
        setSubmitting(false);
        return;
      }

      const saved = await res.json();
      const savedId = saved.id;

      const originalLinkIds = new Set(creator?.social_links?.map((l) => l.id) || []);
      const currentLinkIds = new Set(socialLinks.filter((l) => l.id !== null).map((l) => l.id as number));

      for (const origId of originalLinkIds) {
        if (!currentLinkIds.has(origId)) {
          const delRes = await fetch(`/api/creators/${savedId}/social_links/${origId}/`, { method: "DELETE" });
          if (!delRes.ok) {
            setErrors({ general: "Failed to remove a social link." });
            setSubmitting(false);
            return;
          }
        }
      }

      for (const link of socialLinks) {
        if (link.id === null && link.url) {
          const postRes = await fetch(`/api/creators/${savedId}/social_links/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ platform: link.platform, url: link.url }),
          });
          if (!postRes.ok) {
            setErrors({ general: "Failed to save a social link." });
            setSubmitting(false);
            return;
          }
        }
      }

      const originalTagIds = new Set(creator?.tags?.map((t) => t.id) || []);
      const currentTagIds = new Set(tags.filter((t) => t.id !== null).map((t) => t.id as number));

      for (const origId of originalTagIds) {
        if (!currentTagIds.has(origId)) {
          const delRes = await fetch(`/api/creators/${savedId}/tags/${origId}/`, { method: "DELETE" });
          if (!delRes.ok) {
            setErrors({ general: "Failed to remove a tag." });
            setSubmitting(false);
            return;
          }
        }
      }

      for (const tag of tags) {
        if (tag.id === null && tag.key) {
          const postRes = await fetch(`/api/creators/${savedId}/tags/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: tag.key, value: tag.value || null }),
          });
          if (!postRes.ok) {
            setErrors({ general: "Failed to save a tag." });
            setSubmitting(false);
            return;
          }
        }
      }

      router.push(`/creators/${savedId}`);
    } catch {
      setErrors({ general: "Network error. Please try again." });
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-5 space-y-6">
        {errors.general && (
          <div className="rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 p-3 text-sm text-red-700 dark:text-red-300">
            {errors.general}
          </div>
        )}

        <div>
          <h2 className="text-sm font-semibold mb-4">Basic Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
              />
              {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <input
                type="email"
                placeholder="email@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Source</label>
              <select
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
              >
                <option value="MANUAL_ENTRY">Manual Entry</option>
                <option value="EVENT">Event</option>
                <option value="CAMPAIGN">Campaign</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium mb-1 block">Address</label>
            <textarea
              placeholder="Street, City, State, ZIP"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
            />
          </div>
        </div>

        <hr className="border-zinc-200 dark:border-zinc-800" />

        <SocialLinksField links={socialLinks} onChange={setSocialLinks} />

        <hr className="border-zinc-200 dark:border-zinc-800" />

        <TagsField tags={tags} onChange={setTags} />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? "Saving..." : isEdit ? "Save Changes" : "Create Creator"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
