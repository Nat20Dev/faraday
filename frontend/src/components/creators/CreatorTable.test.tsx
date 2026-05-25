import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreatorTable from "./CreatorTable";
import type { Creator } from "@/types/creator";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/",
}));

const mockCreators: Creator[] = [
  {
    id: 1,
    name: "Alice Chen",
    username: "alicechen",
    email: "alice@example.com",
    address: null,
    source: "MANUAL_ENTRY",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    social_links: [
      { id: 1, platform: "INSTAGRAM", url: "https://instagram.com/alicechen", handle: "alicechen" },
    ],
  },
  {
    id: 2,
    name: "Bob Smith",
    username: "bobsmith",
    email: null,
    address: null,
    source: "EVENT",
    created_at: "2026-01-02T00:00:00Z",
    updated_at: "2026-01-02T00:00:00Z",
    social_links: [],
  },
];

describe("CreatorTable", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders creator names (desktop + mobile views)", () => {
    render(<CreatorTable creators={mockCreators} />);
    const names = screen.getAllByText(/Alice Chen|Bob Smith/);
    expect(names.length).toBeGreaterThanOrEqual(2);
  });

  it("shows empty state when no creators", () => {
    render(<CreatorTable creators={[]} />);
    expect(screen.getByText(/No creators yet/)).toBeDefined();
  });

  it("shows no results message when search matches nothing", async () => {
    render(<CreatorTable creators={mockCreators} />);
    const input = screen.getByPlaceholderText("Search by name or username...");
    await userEvent.type(input, "zzznonexistent");
    expect(screen.getByText(/No creators match/)).toBeDefined();
  });

  it("filters by name when searching", async () => {
    render(<CreatorTable creators={mockCreators} />);
    const input = screen.getByPlaceholderText("Search by name or username...");
    await userEvent.type(input, "Alice");
    const matches = screen.getAllByText("Alice Chen");
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("Bob Smith")).toBeNull();
  });

  it("filters by username when searching", async () => {
    render(<CreatorTable creators={mockCreators} />);
    const input = screen.getByPlaceholderText("Search by name or username...");
    await userEvent.type(input, "bobsmith");
    const matches = screen.getAllByText("Bob Smith");
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("Alice Chen")).toBeNull();
  });

  it("shows source badges in desktop view", () => {
    render(<CreatorTable creators={mockCreators} />);
    const badges = screen.getAllByText(/Manual|Event/);
    expect(badges.length).toBeGreaterThanOrEqual(2);
  });

  it("links to the add creator page", () => {
    render(<CreatorTable creators={mockCreators} />);
    const links = screen.getAllByText("Add Creator");
    expect(links[0]).toBeDefined();
    expect(links[0].closest("a")).toHaveAttribute("href", "/creators/new");
  });
});
