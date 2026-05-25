import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteButton from "./DeleteButton";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("DeleteButton", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

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
});
