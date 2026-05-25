import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TeamForm from "./TeamForm";

const mockPush = vi.fn();
const mockBack = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}));

const mockFetch = vi.fn();

beforeEach(() => {
  mockPush.mockClear();
  mockBack.mockClear();
  mockFetch.mockReset();
  globalThis.fetch = mockFetch;
});

afterEach(() => {
  cleanup();
});

describe("TeamForm", () => {
  it("renders form fields", () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
    render(<TeamForm />);
    expect(screen.getByPlaceholderText("Team name")).toBeDefined();
    expect(screen.getByPlaceholderText("email@example.com")).toBeDefined();
    expect(screen.getByPlaceholderText("Street, City, State, ZIP")).toBeDefined();
    expect(screen.getByText("Create Team")).toBeDefined();
  });

  it("validates required name", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
    render(<TeamForm />);
    await userEvent.click(screen.getByText("Create Team"));
    expect(screen.getByText("Name is required.")).toBeDefined();
  });

  it("POSTs new team on submit (create mode)", async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ id: 1 }) });
    render(<TeamForm />);
    const nameInput = screen.getByPlaceholderText("Team name");
    await userEvent.type(nameInput, "New Team");
    await userEvent.click(screen.getByText("Create Team"));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
    expect(mockFetch).toHaveBeenNthCalledWith(2, "/api/teams/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "New Team",
        email: null,
        address: null,
        source: "MANUAL_ENTRY",
      }),
    });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/teams/1");
    });
  });
});
