import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import RootLayout from "./layout";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("RootLayout", () => {
  it("provides one main landmark for every report page", () => {
    render(<RootLayout params={Promise.resolve({})}><p>Report content</p></RootLayout>);
    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getByRole("main")).toHaveTextContent("Report content");
  });
});
