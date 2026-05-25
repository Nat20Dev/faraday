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
