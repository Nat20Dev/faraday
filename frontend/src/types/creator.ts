export interface SocialLink {
  id: number;
  platform: "INSTAGRAM" | "TIKTOK" | "YOUTUBE" | "TWITCH" | "BLUESKY";
  url: string;
  handle: string | null;
}

export interface Tag {
  id: number;
  key: string;
  value: string | null;
}

export interface Note {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface LinkEntry {
  id: number | null;
  platform: string;
  url: string;
  key: number;
}

export interface TagEntry {
  id: number | null;
  key: string;
  value: string;
  uid: number;
}

export interface Creator {
  id: number;
  name: string;
  username: string;
  email: string | null;
  address: string | null;
  source: "MANUAL_ENTRY" | "EVENT" | "CAMPAIGN";
  created_at: string;
  updated_at: string;
  social_links: SocialLink[];
  tags?: Tag[];
  notes?: Note[];
}

export const PLATFORM_EMOJIS: Record<string, string> = {
  INSTAGRAM: "📸",
  TIKTOK: "🎵",
  YOUTUBE: "▶️",
  TWITCH: "📺",
  BLUESKY: "🦋",
};

export const PLATFORM_ICONS: Record<string, string> = {
  INSTAGRAM: "📸",
  TIKTOK: "🎵",
  YOUTUBE: "▶️",
  TWITCH: "📺",
  BLUESKY: "🦋",
};

export const SOURCE_STYLES: Record<string, string> = {
  MANUAL_ENTRY: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  EVENT: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  CAMPAIGN: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

export const SOURCE_LABELS: Record<string, string> = {
  MANUAL_ENTRY: "Manual Entry",
  EVENT: "Event",
  CAMPAIGN: "Campaign",
};

export interface Team {
  id: number;
  name: string;
  email: string | null;
  address: string | null;
  source: "MANUAL_ENTRY" | "EVENT" | "CAMPAIGN";
  created_at: string;
  updated_at: string;
  social_links: SocialLink[];
  tags: Tag[];
  notes: Note[];
  members: number[];
  member_count: number;
}
