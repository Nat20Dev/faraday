import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-6 px-4 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Faraday</h1>
        <p className="max-w-md text-lg text-zinc-500 dark:text-zinc-400">
          Content creator KPI tracker and CRM dashboard.
        </p>
        <Link
          href="/dashboard"
          className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
