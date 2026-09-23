import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getReport } from "@/lib/report";
import MethodologyPage from "./page";

describe("Methodology page", () => {
  it("explains both passes, mechanical checks, correction safety, and human work", () => {
    render(<MethodologyPage />);
    for (const name of ["Pass 1 research", "Mechanical Python verification", "Pass 2 verification", "Safe correction", "Human review", "Batch orchestration and recovery"]) {
      expect(screen.getByRole("heading", { name })).toBeInTheDocument();
    }
    expect(screen.getByText(/read-only sandbox/i)).toBeInTheDocument();
    expect(screen.getByText(/first-pass record is never overwritten/i)).toBeInTheDocument();
    expect(screen.getByText(/stale running stages/i)).toBeInTheDocument();
  });

  it("includes exact reproduction commands, research date, limitations, and project links", () => {
    render(<MethodologyPage />);
    expect(screen.getByText('uv venv --python 3.12')).toBeInTheDocument();
    expect(screen.getByText('.venv/bin/python batch_runner.py')).toBeInTheDocument();
    expect(screen.getByText(/report_exporter.py/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Limitations" })).toBeInTheDocument();
    const researchDate = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(new Date(getReport().metadata.generated_at));
    expect(screen.getAllByText(new RegExp(researchDate, "i")).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Source repository" })).toHaveAttribute("href", "https://github.com/Charan6924/ScraperAgent");
    expect(screen.getByRole("link", { name: "Live deployment" })).toHaveAttribute("href", "#deployment");
  });
});
