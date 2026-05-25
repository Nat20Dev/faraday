import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import NavBar from "./NavBar";

const store: Record<string, string> = {};

beforeEach(() => {
  Object.keys(store).forEach((k) => delete store[k]);
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
      removeItem: vi.fn((key: string) => { delete store[key]; }),
      clear: vi.fn(() => { Object.keys(store).forEach((k) => delete store[k]); }),
      get length() { return Object.keys(store).length; },
      key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
    },
    writable: true,
  });
  document.documentElement.classList.remove("dark");
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
});

afterEach(() => {
  cleanup();
});

describe("NavBar", () => {
  it("renders the brand name", () => {
    render(<NavBar />);
    expect(screen.getByText("Faraday")).toBeDefined();
  });

  it("renders the Dashboard link", () => {
    render(<NavBar />);
    const link = screen.getByText("Dashboard");
    expect(link).toBeDefined();
    expect(link.closest("a")).toHaveAttribute("href", "/dashboard");
  });

  it("brand link points to home", () => {
    render(<NavBar />);
    const link = screen.getByText("Faraday");
    expect(link.closest("a")).toHaveAttribute("href", "/");
  });

  it("renders the theme toggle button", () => {
    render(<NavBar />);
    expect(screen.getByRole("button", { name: /switch to dark mode/i })).toBeDefined();
  });
});
