import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteTeamButton from "./DeleteTeamButton";

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

describe("DeleteTeamButton", () => {
  it("renders delete button", () => {
    render(<DeleteTeamButton teamId={1} teamName="Alpha Team" />);
    expect(screen.getByText("Delete")).toBeDefined();
  });

  it("shows confirmation dialog on click", async () => {
    render(<DeleteTeamButton teamId={1} teamName="Alpha Team" />);
    await userEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(screen.getByText("Are you sure?")).toBeDefined();
    expect(screen.getByText("Confirm")).toBeDefined();
    expect(screen.getByText("Cancel")).toBeDefined();
  });

  it("hides confirmation when cancel is clicked", async () => {
    render(<DeleteTeamButton teamId={1} teamName="Alpha Team" />);
    await userEvent.click(screen.getByRole("button", { name: /delete/i }));
    await userEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByText("Are you sure?")).toBeNull();
  });

  it("calls fetch DELETE on confirm and navigates to /teams", async () => {
    mockFetch.mockResolvedValue({ ok: true });
    render(<DeleteTeamButton teamId={1} teamName="Alpha Team" />);
    await userEvent.click(screen.getByRole("button", { name: /delete/i }));
    await userEvent.click(screen.getByText("Confirm"));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/teams/1/", { method: "DELETE" });
    });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/teams");
    });
  });
});
