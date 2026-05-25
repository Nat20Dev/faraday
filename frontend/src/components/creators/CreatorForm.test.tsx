import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreatorForm from "./CreatorForm";
import type { Creator } from "@/types/creator";

const mockPush = vi.fn();
const mockBack = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}));

const mockFetch = vi.fn();

const editCreator: Creator = {
  id: 1,
  name: "Alice Chen",
  username: "alicechen",
  email: "alice@example.com",
  address: "123 Main St",
  source: "EVENT",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  social_links: [],
};

beforeEach(() => {
  mockPush.mockClear();
  mockBack.mockClear();
  mockFetch.mockClear();
  globalThis.fetch = mockFetch;
});

afterEach(() => {
  cleanup();
});

describe("CreatorForm", () => {
  it("renders form fields with create button", () => {
    render(<CreatorForm />);
    expect(screen.getByPlaceholderText("Full name")).toBeDefined();
    expect(screen.getByPlaceholderText("username")).toBeDefined();
    expect(screen.getByPlaceholderText("email@example.com")).toBeDefined();
    expect(screen.getByText("Create Creator")).toBeDefined();
  });

  it("pre-fills fields and shows Save Changes in edit mode", () => {
    render(<CreatorForm creator={editCreator} />);
    expect(screen.getByPlaceholderText("Full name")).toHaveValue("Alice Chen");
    expect(screen.getByPlaceholderText("username")).toHaveValue("alicechen");
    expect(screen.getByPlaceholderText("email@example.com")).toHaveValue("alice@example.com");
    expect(screen.getByText("Save Changes")).toBeDefined();
  });

  it("shows validation errors for empty name and username on submit", async () => {
    render(<CreatorForm />);
    await userEvent.click(screen.getByText("Create Creator"));
    expect(screen.getByText("Name is required.")).toBeDefined();
    expect(screen.getByText("Username is required.")).toBeDefined();
  });

  it("validates email format", async () => {
    const { container } = render(<CreatorForm />);
    await userEvent.type(screen.getByPlaceholderText("Full name"), "Alice Chen");
    await userEvent.type(screen.getByPlaceholderText("username"), "alicechen");
    await userEvent.type(screen.getByPlaceholderText("email@example.com"), "notanemail");
    const form = container.querySelector("form")!;
    fireEvent.submit(form);
    await waitFor(() => {
      expect(screen.getByText("Please enter a valid email address.")).toBeDefined();
    });
  });

  it("does not show email error when email is empty", async () => {
    render(<CreatorForm />);
    await userEvent.type(screen.getByPlaceholderText("Full name"), "Alice Chen");
    await userEvent.type(screen.getByPlaceholderText("username"), "alicechen");
    await userEvent.click(screen.getByText("Create Creator"));
    expect(screen.queryByText("Please enter a valid email address.")).toBeNull();
  });

  it("submits new creator via POST and navigates to detail", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, name: "Alice Chen", username: "alicechen" }),
    });

    render(<CreatorForm />);
    await userEvent.type(screen.getByPlaceholderText("Full name"), "Alice Chen");
    await userEvent.type(screen.getByPlaceholderText("username"), "alicechen");
    await userEvent.click(screen.getByText("Create Creator"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/creators/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Alice Chen",
          username: "alicechen",
          email: null,
          address: null,
          source: "MANUAL_ENTRY",
        }),
      });
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/creators/1");
    });
  });

  it("submits edit via PUT with pre-filled data", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => editCreator,
    });

    render(<CreatorForm creator={editCreator} />);
    await userEvent.click(screen.getByText("Save Changes"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/creators/1/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Alice Chen",
          username: "alicechen",
          email: "alice@example.com",
          address: "123 Main St",
          source: "EVENT",
        }),
      });
    });
  });

  it("shows API field errors", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ name: ["This name is taken."], username: ["A user with this username already exists."] }),
    });

    render(<CreatorForm />);
    await userEvent.type(screen.getByPlaceholderText("Full name"), "Alice Chen");
    await userEvent.type(screen.getByPlaceholderText("username"), "alicechen");
    await userEvent.click(screen.getByText("Create Creator"));

    await waitFor(() => {
      expect(screen.getByText("This name is taken.")).toBeDefined();
    });
    expect(screen.getByText("A user with this username already exists.")).toBeDefined();
  });

  it("shows general error for non-field API errors", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ detail: "Not found" }),
    });

    render(<CreatorForm />);
    await userEvent.type(screen.getByPlaceholderText("Full name"), "Alice Chen");
    await userEvent.type(screen.getByPlaceholderText("username"), "alicechen");
    await userEvent.click(screen.getByText("Create Creator"));

    await waitFor(() => {
      expect(screen.getByText("Failed to save creator.")).toBeDefined();
    });
  });

  it("handles network error", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    render(<CreatorForm />);
    await userEvent.type(screen.getByPlaceholderText("Full name"), "Alice Chen");
    await userEvent.type(screen.getByPlaceholderText("username"), "alicechen");
    await userEvent.click(screen.getByText("Create Creator"));

    await waitFor(() => {
      expect(screen.getByText("Network error. Please try again.")).toBeDefined();
    });
  });

  it("disables submit button while submitting", async () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));

    render(<CreatorForm />);
    await userEvent.type(screen.getByPlaceholderText("Full name"), "Alice Chen");
    await userEvent.type(screen.getByPlaceholderText("username"), "alicechen");
    await userEvent.click(screen.getByText("Create Creator"));

    expect(await screen.findByText("Saving...")).toBeDefined();
  });

  describe("social_links submission", () => {
    it("POSTs new social links on create", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 1 }),
      });

      render(<CreatorForm />);
      await userEvent.type(screen.getByPlaceholderText("Full name"), "Alice Chen");
      await userEvent.type(screen.getByPlaceholderText("username"), "alicechen");
      await userEvent.click(screen.getByText("Add Social Link"));
      await userEvent.type(screen.getByPlaceholderText("https://..."), "https://instagram.com/alice");

      await userEvent.click(screen.getByText("Create Creator"));

      await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));

      expect(mockFetch).toHaveBeenNthCalledWith(1, "/api/creators/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Alice Chen",
          username: "alicechen",
          email: null,
          address: null,
          source: "MANUAL_ENTRY",
        }),
      });

      expect(mockFetch).toHaveBeenNthCalledWith(2, "/api/creators/1/social_links/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: "INSTAGRAM", url: "https://instagram.com/alice" }),
      });
    });

    it("DELETEs removed social links on edit", async () => {
      const creatorWithLink: Creator = {
        ...editCreator,
        social_links: [
          { id: 5, platform: "INSTAGRAM", url: "https://instagram.com/alice", handle: null },
        ],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 1 }),
      });

      const { container } = render(<CreatorForm creator={creatorWithLink} />);

      const removeBtn = container
        .querySelector('input[placeholder="https://..."]')
        ?.parentElement?.querySelector("button");
      await userEvent.click(removeBtn!);

      await userEvent.click(screen.getByText("Save Changes"));

      await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));

      expect(mockFetch).toHaveBeenNthCalledWith(1, "/api/creators/1/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Alice Chen",
          username: "alicechen",
          email: "alice@example.com",
          address: "123 Main St",
          source: "EVENT",
        }),
      });

      expect(mockFetch).toHaveBeenNthCalledWith(2, "/api/creators/1/social_links/5/", {
        method: "DELETE",
      });
    });

    it("skips existing social links (no extra POST/DELETE)", async () => {
      const creatorWithLink: Creator = {
        ...editCreator,
        social_links: [
          { id: 5, platform: "INSTAGRAM", url: "https://instagram.com/alice", handle: null },
        ],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 1 }),
      });

      render(<CreatorForm creator={creatorWithLink} />);

      await userEvent.click(screen.getByText("Save Changes"));

      await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

      expect(mockFetch).toHaveBeenCalledWith("/api/creators/1/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Alice Chen",
          username: "alicechen",
          email: "alice@example.com",
          address: "123 Main St",
          source: "EVENT",
        }),
      });
    });
  });

  describe("tags submission", () => {
    it("POSTs new tags on create", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 1 }),
      });

      render(<CreatorForm />);
      await userEvent.type(screen.getByPlaceholderText("Full name"), "Alice Chen");
      await userEvent.type(screen.getByPlaceholderText("username"), "alicechen");
      await userEvent.click(screen.getByText("Add Tag"));
      await userEvent.type(screen.getByPlaceholderText("Key"), "genre");
      await userEvent.type(screen.getByPlaceholderText("Value (optional)"), "tech");

      await userEvent.click(screen.getByText("Create Creator"));

      await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));

      expect(mockFetch).toHaveBeenNthCalledWith(1, "/api/creators/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Alice Chen",
          username: "alicechen",
          email: null,
          address: null,
          source: "MANUAL_ENTRY",
        }),
      });

      expect(mockFetch).toHaveBeenNthCalledWith(2, "/api/creators/1/tags/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "genre", value: "tech" }),
      });
    });

    it("DELETEs removed tags on edit", async () => {
      const creatorWithTag: Creator = {
        ...editCreator,
        tags: [{ id: 10, key: "genre", value: "tech" }],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 1 }),
      });

      const { container } = render(<CreatorForm creator={creatorWithTag} />);

      const removeBtn = container
        .querySelector('input[placeholder="Key"]')
        ?.parentElement?.querySelector("button");
      await userEvent.click(removeBtn!);

      await userEvent.click(screen.getByText("Save Changes"));

      await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));

      expect(mockFetch).toHaveBeenNthCalledWith(1, "/api/creators/1/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Alice Chen",
          username: "alicechen",
          email: "alice@example.com",
          address: "123 Main St",
          source: "EVENT",
        }),
      });

      expect(mockFetch).toHaveBeenNthCalledWith(2, "/api/creators/1/tags/10/", {
        method: "DELETE",
      });
    });

    it("skips existing tags (no extra POST/DELETE)", async () => {
      const creatorWithTag: Creator = {
        ...editCreator,
        tags: [{ id: 10, key: "genre", value: "tech" }],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 1 }),
      });

      render(<CreatorForm creator={creatorWithTag} />);

      await userEvent.click(screen.getByText("Save Changes"));

      await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

      expect(mockFetch).toHaveBeenCalledWith("/api/creators/1/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Alice Chen",
          username: "alicechen",
          email: "alice@example.com",
          address: "123 Main St",
          source: "EVENT",
        }),
      });
    });
  });
});
