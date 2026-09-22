import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("Overview", () => {
  it("summarizes the partial 100-app dataset and buildability verdicts", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("45 integrations can be built now");
    expect(screen.getByText(/98 of 100 apps completed/i)).toBeInTheDocument();
    expect(screen.getByText(/preliminary snapshot/i)).toBeInTheDocument();
    const totals = screen.getByLabelText("Buildability totals");
    expect(within(totals).getByText("Build now").closest("article")).toHaveTextContent("45");
    expect(within(totals).getByText("Conditional").closest("article")).toHaveTextContent("52");
    expect(within(totals).getByText("Blocked").closest("article")).toHaveTextContent("1");
    expect(within(totals).getByText("Unknown").closest("article")).toHaveTextContent("0");
  });

  it("shows four findings, verification context, and the two-pass workflow", () => {
    render(<Home />);
    const findings = screen.getByRole("list", { name: "Key findings" });
    expect(within(findings).getAllByRole("listitem")).toHaveLength(4);
    expect(findings).toHaveTextContent("OAuth 2.0");
    expect(findings.textContent).toMatch(/mixed/i);
    expect(findings.textContent).toMatch(/admin approval/i);
    expect(findings).toHaveTextContent("REST");
    expect(screen.getByText(/6,424 of 7,390 checked claims/i)).toBeInTheDocument();
    expect(screen.getByText(/not ground-truth accuracy/i)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /two-pass research workflow/i })).toHaveTextContent("Pass 1");
    expect(screen.getByRole("img", { name: /two-pass research workflow/i })).toHaveTextContent("Pass 2");
  });

  it("links to every deeper report page", () => {
    render(<Home />);
    for (const [name, href] of [
      ["Explore trends", "/trends"],
      ["Browse all apps", "/apps"],
      ["Review verification", "/verification"],
      ["Read methodology", "/methodology"],
    ]) {
      expect(screen.getAllByRole("link", { name }).some((link) => link.getAttribute("href") === href)).toBe(true);
    }
  });
});
