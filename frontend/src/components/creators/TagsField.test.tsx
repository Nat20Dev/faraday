import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import TagsField from "./TagsField";

function TagsFieldWrapper() {
  const [tags, setTags] = useState<Array<{ key: string; value: string; uid: number }>>([]);
  return <TagsField tags={tags} onChange={setTags} />;
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

describe("TagsField", () => {
  it("renders add button", () => {
    render(<TagsFieldWrapper />);
    expect(screen.getByText("Add Tag")).toBeDefined();
  });

  it("adds a row with key and value inputs on click", async () => {
    render(<TagsFieldWrapper />);
    await userEvent.click(screen.getByText("Add Tag"));
    expect(screen.getByPlaceholderText("Key")).toBeDefined();
    expect(screen.getByPlaceholderText("Value (optional)")).toBeDefined();
  });

  it("adds multiple rows", async () => {
    render(<TagsFieldWrapper />);
    await userEvent.click(screen.getByText("Add Tag"));
    await userEvent.click(screen.getByText("Add Tag"));
    const inputs = screen.getAllByPlaceholderText("Key");
    expect(inputs.length).toBe(2);
  });

  it("removes a row on click", async () => {
    render(<TagsFieldWrapper />);
    await userEvent.click(screen.getByText("Add Tag"));
    await userEvent.click(screen.getByText("Add Tag"));
    const removeButtons = screen.getAllByRole("button");
    const addBtn = screen.getByText("Add Tag");
    const removeBtn = removeButtons.find((b) => b !== addBtn && b.querySelector("svg"));
    expect(removeBtn).toBeDefined();
    if (removeBtn) await userEvent.click(removeBtn);
    const inputs = screen.queryAllByPlaceholderText("Key");
    expect(inputs.length).toBe(1);
  });
});
