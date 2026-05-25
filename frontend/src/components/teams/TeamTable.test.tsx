import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TeamTable from "./TeamTable";
import type { Team } from "@/types/creator";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const mockTeams: Team[] = [
  {
    id: 1,
    name: "Alpha Team",
    email: null,
    address: null,
    source: "MANUAL_ENTRY",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    social_links: [],
    tags: [],
    notes: [],
    members: [],
    member_count: 0,
  },
  {
    id: 2,
    name: "Beta Squad",
    email: "beta@example.com",
    address: null,
    source: "EVENT",
    created_at: "2026-01-02T00:00:00Z",
    updated_at: "2026-01-02T00:00:00Z",
    social_links: [],
    tags: [],
    notes: [],
    members: [],
    member_count: 3,
  },
];

describe("TeamTable", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders team names in the table", () => {
    render(<TeamTable teams={mockTeams} />);
    const names = screen.getAllByText(/Alpha Team|Beta Squad/);
    expect(names.length).toBeGreaterThanOrEqual(2);
  });

  it("shows empty state when no teams", () => {
    render(<TeamTable teams={[]} />);
    expect(screen.getByText(/No teams yet/)).toBeDefined();
  });

  it("shows no results when search matches nothing", async () => {
    render(<TeamTable teams={mockTeams} />);
    const input = screen.getByPlaceholderText("Search by name...");
    await userEvent.type(input, "zzznonexistent");
    expect(screen.getByText(/No teams match/)).toBeDefined();
  });

  it("filters by name when searching", async () => {
    render(<TeamTable teams={mockTeams} />);
    const input = screen.getByPlaceholderText("Search by name...");
    await userEvent.type(input, "Alpha");
    const matches = screen.getAllByText("Alpha Team");
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("Beta Squad")).toBeNull();
  });

  it("shows source badges", () => {
    render(<TeamTable teams={mockTeams} />);
    const badges = screen.getAllByText(/Manual|Event/);
    expect(badges.length).toBeGreaterThanOrEqual(2);
  });

  it("shows member count", () => {
    render(<TeamTable teams={mockTeams} />);
    expect(screen.getByText("0")).toBeDefined();
    expect(screen.getByText("3")).toBeDefined();
  });

  it("links to add team page", () => {
    render(<TeamTable teams={mockTeams} />);
    const links = screen.getAllByText("Add Team");
    expect(links[0]).toBeDefined();
    expect(links[0].closest("a")).toHaveAttribute("href", "/teams/new");
  });
});
