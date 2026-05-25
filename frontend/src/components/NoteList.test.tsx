import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NoteList from "./NoteList";
import type { Note } from "@/types/creator";

vi.mock("next/navigation", () => ({}));

const mockOnAdd = vi.fn();
const mockOnEdit = vi.fn();
const mockOnDelete = vi.fn();

const sampleNotes: Note[] = [
  { id: 1, content: "First note", created_at: "2026-05-25T10:00:00Z", updated_at: "2026-05-25T10:00:00Z" },
  { id: 2, content: "Second note", created_at: "2026-05-25T12:00:00Z", updated_at: "2026-05-25T12:00:00Z" },
];

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("NoteList", () => {
  it("renders existing notes", () => {
    render(<NoteList notes={sampleNotes} onAdd={mockOnAdd} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    expect(screen.getByText("First note")).toBeDefined();
    expect(screen.getByText("Second note")).toBeDefined();
    expect(screen.getByText("Notes (2)")).toBeDefined();
  });

  it("shows empty state", () => {
    render(<NoteList notes={[]} onAdd={mockOnAdd} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    expect(screen.getByText("No notes yet.")).toBeDefined();
    expect(screen.getByText("Notes (0)")).toBeDefined();
  });

  it("renders add note textarea", () => {
    render(<NoteList notes={[]} onAdd={mockOnAdd} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    expect(screen.getByPlaceholderText("Add a note...")).toBeDefined();
    expect(screen.getByText("Add Note")).toBeDefined();
  });

  it("calls onAdd callback when submitting new note", async () => {
    mockOnAdd.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<NoteList notes={[]} onAdd={mockOnAdd} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    await user.type(screen.getByPlaceholderText("Add a note..."), "New note content");
    await user.click(screen.getByText("Add Note"));
    expect(mockOnAdd).toHaveBeenCalledWith("New note content");
  });

  it("calls onEdit callback when editing a note", async () => {
    mockOnEdit.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<NoteList notes={sampleNotes} onAdd={mockOnAdd} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    const editButtons = screen.getAllByLabelText("Edit note");
    await user.click(editButtons[0]);
    const textareas = screen.getAllByRole("textbox");
    const editTextarea = textareas[0];
    await user.clear(editTextarea);
    await user.type(editTextarea, "Edited content");
    await user.click(screen.getByText("Save"));
    expect(mockOnEdit).toHaveBeenCalledWith(2, "Edited content");
  });

  it("calls onDelete callback when deleting a note", async () => {
    mockOnDelete.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<NoteList notes={sampleNotes} onAdd={mockOnAdd} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    const deleteButtons = screen.getAllByLabelText("Delete note");
    await user.click(deleteButtons[0]);
    await user.click(screen.getByText("Confirm"));
    expect(mockOnDelete).toHaveBeenCalledWith(2);
  });

  it("displays error when onAdd rejects", async () => {
    mockOnAdd.mockRejectedValue(new Error("Server error"));
    const user = userEvent.setup();
    render(<NoteList notes={sampleNotes} onAdd={mockOnAdd} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    await user.type(screen.getByPlaceholderText("Add a note..."), "New note");
    await user.click(screen.getByText("Add Note"));
    expect(screen.getByText("Server error")).toBeDefined();
  });

  it("displays error when onEdit rejects", async () => {
    mockOnEdit.mockRejectedValue(new Error("Edit failed"));
    const user = userEvent.setup();
    render(<NoteList notes={sampleNotes} onAdd={mockOnAdd} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    const editButtons = screen.getAllByLabelText("Edit note");
    await user.click(editButtons[0]);
    const textareas = screen.getAllByRole("textbox");
    await user.clear(textareas[0]);
    await user.type(textareas[0], "Updated");
    await user.click(screen.getByText("Save"));
    expect(screen.getByText("Edit failed")).toBeDefined();
  });

  it("displays error when onDelete rejects", async () => {
    mockOnDelete.mockRejectedValue(new Error("Delete failed"));
    const user = userEvent.setup();
    render(<NoteList notes={sampleNotes} onAdd={mockOnAdd} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    const deleteButtons = screen.getAllByLabelText("Delete note");
    await user.click(deleteButtons[0]);
    await user.click(screen.getByText("Confirm"));
    expect(screen.getByText("Delete failed")).toBeDefined();
  });

  it("displays fallback error when rejection is not an Error", async () => {
    mockOnAdd.mockRejectedValue("string error");
    const user = userEvent.setup();
    render(<NoteList notes={sampleNotes} onAdd={mockOnAdd} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    await user.type(screen.getByPlaceholderText("Add a note..."), "Another note");
    await user.click(screen.getByText("Add Note"));
    expect(screen.getByText("Failed to add note")).toBeDefined();
  });
});
