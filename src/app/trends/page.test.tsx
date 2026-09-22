import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import TrendsPage from "./page";

describe("Trends page", () => {
  it("covers every requested research dimension with exact values", () => {
    render(<TrendsPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/access constraints/i);
    for (const name of [
      "Authentication",
      "Access model",
      "Plan path",
      "Buildability",
      "Primary blockers",
      "API interfaces",
      "Strict MCP availability",
      "Where to start",
    ]) {
      expect(screen.getByRole("region", { name })).toBeInTheDocument();
    }
    expect(screen.getAllByText(/multi-select counts/i).length).toBeGreaterThan(0);
  });

  it("uses normalized strict MCP status rather than the raw model label", () => {
    render(<TrendsPage />);
    const section = screen.getByRole("region", { name: "Strict MCP availability" });
    const totals = within(section).getByRole("list", { name: "Overall totals" });
    expect(within(totals).getByText("Official").closest("li")).toHaveTextContent("37");
    expect(within(totals).getByText("Community").closest("li")).toHaveTextContent("21");
    expect(within(totals).getByText("None Found").closest("li")).toHaveTextContent("6");
    expect(within(totals).getByText("Unknown").closest("li")).toHaveTextContent("34");
    expect(section).toHaveTextContent(/GitHub, docs, and direct MCP evidence/i);
  });

  it("shows category context and distinguishes easy wins from outreach", () => {
    render(<TrendsPage />);
    expect(screen.getAllByText("CRM and Sales").length).toBeGreaterThan(0);
    const start = screen.getByRole("region", { name: "Where to start" });
    expect(start).toHaveTextContent("Easy wins");
    expect(start).toHaveTextContent("Outreach-dependent");
    expect(start).toHaveTextContent(/build now/i);
  });
});
