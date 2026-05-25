import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import SocialLinksField from "./SocialLinksField";

function SocialLinksFieldWrapper() {
  const [links, setLinks] = useState<Array<{ platform: string; url: string; key: number }>>([]);
  return <SocialLinksField links={links} onChange={setLinks} />;
}

let keyCounter = 0;

beforeEach(() => {
  vi.spyOn(Date, "now").mockImplementation(() => ++keyCounter);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  keyCounter = 0;
});

describe("SocialLinksField", () => {
  it("renders add button", () => {
    render(<SocialLinksFieldWrapper />);
    expect(screen.getByText("Add Social Link")).toBeDefined();
  });

  it("adds a row with platform dropdown and url input on click", async () => {
    render(<SocialLinksFieldWrapper />);
    await userEvent.click(screen.getByText("Add Social Link"));
    expect(screen.getByDisplayValue("INSTAGRAM")).toBeDefined();
    expect(screen.getByPlaceholderText("https://...")).toBeDefined();
  });

  it("adds multiple rows", async () => {
    render(<SocialLinksFieldWrapper />);
    await userEvent.click(screen.getByText("Add Social Link"));
    await userEvent.click(screen.getByText("Add Social Link"));
    const inputs = screen.getAllByPlaceholderText("https://...");
    expect(inputs.length).toBe(2);
  });

  it("removes a row on click", async () => {
    render(<SocialLinksFieldWrapper />);
    await userEvent.click(screen.getByText("Add Social Link"));
    await userEvent.click(screen.getByText("Add Social Link"));
    const removeButtons = screen.getAllByRole("button");
    const addBtn = screen.getByText("Add Social Link");
    const removeBtn = removeButtons.find((b) => b !== addBtn && b.querySelector("svg"));
    expect(removeBtn).toBeDefined();
    if (removeBtn) await userEvent.click(removeBtn);
    const inputs = screen.queryAllByPlaceholderText("https://...");
    expect(inputs.length).toBe(1);
  });
});
