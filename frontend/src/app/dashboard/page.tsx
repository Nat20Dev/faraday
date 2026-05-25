import CreatorTable from "@/components/creators/CreatorTable";
import type { Creator } from "@/types/creator";

async function getCreators(): Promise<Creator[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/creators/`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load creators");
  return res.json();
}

export default async function DashboardPage() {
  let creators: Creator[] = [];
  let error: string | null = null;

  try {
    creators = await getCreators();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load creators";
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Creators</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {creators.length} {creators.length === 1 ? "creator" : "creators"} tracked
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 p-4 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      ) : (
        <CreatorTable creators={creators} />
      )}
    </div>
  );
}
