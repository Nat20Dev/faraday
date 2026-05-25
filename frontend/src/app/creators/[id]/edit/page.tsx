import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CreatorForm from "@/components/creators/CreatorForm";
import type { Creator } from "@/types/creator";

async function getCreator(id: string): Promise<Creator> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/creators/${id}/`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Not found");
  return res.json();
}

export default async function EditCreatorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let creator: Creator | null = null;
  let error = false;

  try {
    creator = await getCreator(id);
  } catch {
    error = true;
  }

  if (error || !creator) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">Creator not found.</p>
        <Link href="/dashboard" className="mt-4 inline-block text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link href={`/creators/${creator.id}`} className="inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-6 transition-colors">
        <ArrowLeft size={14} />
        Back to {creator.name}
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Edit Creator</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Update the details below.</p>
      </div>

      <CreatorForm creator={creator} />
    </div>
  );
}
