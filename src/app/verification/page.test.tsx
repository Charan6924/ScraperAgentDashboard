import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { VerificationBreakdown } from "@/components/verification-breakdown";
import VerificationPage from "./page";

describe("Verification page", () => {
  it("reports claim, citation, correction, and human-review outcomes", () => {
    render(<VerificationPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/6,424 claims were supported/i);
    const claims = screen.getByRole("region", { name: "Claim outcomes" });
    expect(claims).toHaveTextContent("6,424");
    expect(claims).toHaveTextContent("32");
    expect(claims).toHaveTextContent("806");
    expect(claims).toHaveTextContent("128");
    expect(screen.getByText(/89% of original citations/i)).toBeInTheDocument();
    expect(screen.getByText(/35 proposed/i)).toBeInTheDocument();
    expect(screen.getByText(/10 applied/i)).toBeInTheDocument();
    expect(screen.getByText(/25 rejected/i)).toBeInTheDocument();
    expect(screen.getByText(/128 claims require human source search/i)).toBeInTheDocument();
  });

  it("shows deterministic case-study types, failures, and the accuracy caveat", () => {
    render(<VerificationPage />);
    const studies = screen.getByRole("region", { name: "Verification case studies" });
    for (const label of ["Highest support", "Lowest support", "Applied correction", "Rejected correction", "Unavailable source", "Pipeline exception"]) {
      expect(within(studies).getAllByText(label).length).toBeGreaterThan(0);
    }
    expect(studies).toHaveTextContent("Klaviyo");
    expect(studies).toHaveTextContent("fanbasis");
    expect(screen.getByText(/not ground-truth accuracy/i)).toBeInTheDocument();
  });

  it("renders a truthful zero state", () => {
    render(<VerificationBreakdown checked={0} supported={0} contradicted={0} insufficient={0} unavailable={0} />);
    expect(screen.getByText("No claims were checked.")).toBeInTheDocument();
    expect(screen.queryByText(/NaN|Infinity/)).not.toBeInTheDocument();
  });
});
