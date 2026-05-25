import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteButton from "./DeleteButton";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockFetch = vi.fn();

beforeEach(() => {
  mockPush.mockClear();
  mockFetch.mockReset();
  globalThis.fetch = mockFetch;
});

afterEach(() => {
  cleanup();
});

describe("DeleteButton", () => {
  it("renders delete button", () => {
    render(<DeleteButton creatorId={1} creatorName="Alice Chen" />);
    expect(screen.getByText("Delete")).toBeDefined();
  });

  it("shows confirmation dialog on click", async () => {
    render(<DeleteButton creatorId={1} creatorName="Alice Chen" />);
    await userEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(screen.getByText("Are you sure?")).toBeDefined();
    expect(screen.getByText("Confirm")).toBeDefined();
    expect(screen.getByText("Cancel")).toBeDefined();
  });

  it("hides confirmation when cancel is clicked", async () => {
    render(<DeleteButton creatorId={1} creatorName="Alice Chen" />);
    await userEvent.click(screen.getByRole("button", { name: /delete/i }));
    await userEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByText("Are you sure?")).toBeNull();
  });

  it("calls fetch DELETE on confirm and navigates to dashboard", async () => {
    mockFetch.mockResolvedValue({ ok: true });
    render(<DeleteButton creatorId={1} creatorName="Alice Chen" />);
    await userEvent.click(screen.getByRole("button", { name: /delete/i }));
    await userEvent.click(screen.getByText("Confirm"));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/creators/1/", { method: "DELETE" });
    });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows Deleting... while delete request is in flight", async () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));
    render(<DeleteButton creatorId={1} creatorName="Alice Chen" />);
    await userEvent.click(screen.getByRole("button", { name: /delete/i }));
    await userEvent.click(screen.getByText("Confirm"));
    expect(await screen.findByText("Deleting...")).toBeDefined();
  });

  it("returns to initial state on API error", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));
    render(<DeleteButton creatorId={1} creatorName="Alice Chen" />);
    await userEvent.click(screen.getByRole("button", { name: /delete/i }));
    await userEvent.click(screen.getByText("Confirm"));
    await waitFor(() => {
      expect(screen.getByText("Delete")).toBeDefined();
    });
    expect(screen.queryByText("Are you sure?")).toBeNull();
  });
});
