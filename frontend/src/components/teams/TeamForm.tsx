"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import SocialLinksField from "@/components/creators/SocialLinksField";
import TagsField from "@/components/creators/TagsField";
import type { Team, Creator, LinkEntry, TagEntry } from "@/types/creator";

interface FormData {
  name: string;
  email: string;
  address: string;
  source: string;
}

interface Errors {
  name?: string;
  email?: string;
  general?: string;
}

export default function TeamForm({ team }: { team?: Team }) {
  const isEdit = !!team;
  const router = useRouter();

  const [form, setForm] = useState<FormData>({
    name: team?.name || "",
    email: team?.email || "",
    address: team?.address || "",
    source: team?.source || "MANUAL_ENTRY",
  });

  const [socialLinks, setSocialLinks] = useState<LinkEntry[]>(
    team?.social_links?.map((l) => ({ id: l.id, platform: l.platform, url: l.url, key: l.id })) || []
  );

  const [tags, setTags] = useState<TagEntry[]>(
    team?.tags?.map((t) => ({ id: t.id, key: t.key, value: t.value || "", uid: t.id })) || []
  );

  const [memberIds, setMemberIds] = useState<number[]>(team?.members || []);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [memberSearch, setMemberSearch] = useState("");

  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/creators/")
      .then((res) => res.json())
      .then((data: Creator[]) => setCreators(data))
      .catch(() => {});
  }, []);

  const creatorMap = new Map(creators.map((c) => [c.id, c]));

  function validate(): boolean {
    const e: Errors = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Please enter a valid email address.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function addMember(id: number) {
    if (!memberIds.includes(id)) {
      setMemberIds([...memberIds, id]);
    }
  }

  function removeMember(id: number) {
    setMemberIds(memberIds.filter((mid) => mid !== id));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setErrors({});

    try {
      const url = isEdit ? `/api/teams/${team.id}/` : "/api/teams/";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
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
            if (key === "name" || key === "email") {
              apiErrors[key as "name" | "email"] = Array.isArray(msgs) ? msgs[0] : String(msgs);
            }
          }
          setErrors(Object.keys(apiErrors).length > 0 ? apiErrors : { general: "Failed to save team." });
        } else {
          setErrors({ general: "Failed to save team." });
        }
        setSubmitting(false);
        return;
      }

      const saved = await res.json();
      const savedId = saved.id;

      const originalLinkIds = new Set(team?.social_links?.map((l) => l.id) || []);
      const currentLinkIds = new Set(socialLinks.filter((l) => l.id !== null).map((l) => l.id as number));

      for (const origId of originalLinkIds) {
        if (!currentLinkIds.has(origId)) {
          const delRes = await fetch(`/api/teams/${savedId}/social_links/${origId}/`, { method: "DELETE" });
          if (!delRes.ok) {
            setErrors({ general: "Failed to remove a social link." });
            setSubmitting(false);
            return;
          }
        }
      }

      for (const link of socialLinks) {
        if (link.id === null && link.url) {
          const postRes = await fetch(`/api/teams/${savedId}/social_links/`, {
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

      const originalTagIds = new Set(team?.tags?.map((t) => t.id) || []);
      const currentTagIds = new Set(tags.filter((t) => t.id !== null).map((t) => t.id as number));

      for (const origId of originalTagIds) {
        if (!currentTagIds.has(origId)) {
          const delRes = await fetch(`/api/teams/${savedId}/tags/${origId}/`, { method: "DELETE" });
          if (!delRes.ok) {
            setErrors({ general: "Failed to remove a tag." });
            setSubmitting(false);
            return;
          }
        }
      }

      for (const tag of tags) {
        if (tag.id === null && tag.key) {
          const postRes = await fetch(`/api/teams/${savedId}/tags/`, {
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

      const originalMemberIds = new Set(team?.members || []);
      const currentMemberIds = new Set(memberIds);

      for (const mid of originalMemberIds) {
        if (!currentMemberIds.has(mid)) {
          const delRes = await fetch(`/api/teams/${savedId}/members/`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ creator_id: mid }),
          });
          if (!delRes.ok) {
            setErrors({ general: "Failed to remove a member." });
            setSubmitting(false);
            return;
          }
        }
      }

      for (const mid of memberIds) {
        if (!originalMemberIds.has(mid)) {
          const postRes = await fetch(`/api/teams/${savedId}/members/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ creator_id: mid }),
          });
          if (!postRes.ok) {
            setErrors({ general: "Failed to add a member." });
            setSubmitting(false);
            return;
          }
        }
      }

      router.push(`/teams/${savedId}`);
    } catch {
      setErrors({ general: "Network error. Please try again." });
      setSubmitting(false);
    }
  }

  const availableCreators = creators.filter((c) => !memberIds.includes(c.id));

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
              <label htmlFor="team-name" className="text-sm font-medium mb-1 block">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="team-name"
                type="text"
                placeholder="Team name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="team-email" className="text-sm font-medium mb-1 block">Email</label>
              <input
                id="team-email"
                type="email"
                placeholder="email@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="team-source" className="text-sm font-medium mb-1 block">Source</label>
              <select
                id="team-source"
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
            <label htmlFor="team-address" className="text-sm font-medium mb-1 block">Address</label>
            <textarea
              id="team-address"
              placeholder="Street, City, State, ZIP"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
            />
          </div>
        </div>

        <hr className="border-zinc-200 dark:border-zinc-800" />

        <div>
          <h2 className="text-sm font-semibold mb-4">Members</h2>
          {memberIds.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {memberIds.map((id) => {
                const creator = creatorMap.get(id);
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-xs font-medium"
                  >
                    {creator ? creator.name : `Creator #${id}`}
                    <button type="button" onClick={() => removeMember(id)} className="text-zinc-400 hover:text-red-500 transition-colors">
                      <X size={12} />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
          {availableCreators.length > 0 && (
            <div>
              <input
                type="text"
                placeholder="Search creators to add..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 mb-2"
              />
              <div className="max-h-40 overflow-y-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
                {availableCreators
                  .filter((c) => c.name.toLowerCase().includes(memberSearch.toLowerCase()) || c.username.toLowerCase().includes(memberSearch.toLowerCase()))
                  .map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        addMember(c.id);
                        setMemberSearch("");
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      {c.name} <span className="text-zinc-400">@{c.username}</span>
                    </button>
                  ))}
                {availableCreators.filter((c) =>
                  c.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                  c.username.toLowerCase().includes(memberSearch.toLowerCase())
                ).length === 0 && (
                  <p className="px-3 py-2 text-sm text-zinc-400">No creators found.</p>
                )}
              </div>
            </div>
          )}
          {availableCreators.length === 0 && creators.length > 0 && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">All creators are already members.</p>
          )}
          {creators.length === 0 && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No creators available. Create creators first.</p>
          )}
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
          {submitting ? "Saving..." : isEdit ? "Save Changes" : "Create Team"}
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
