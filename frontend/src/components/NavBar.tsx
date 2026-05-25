import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function NavBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm">
      <nav className="max-w-7xl mx-auto flex items-center justify-between h-14 px-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Faraday
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            Dashboard
          </Link>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
