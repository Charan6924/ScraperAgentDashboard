import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SiteHeader } from "./site-header";
import { StatusBadge } from "./status-badge";

const usePathname = vi.fn(() => "/trends");

vi.mock("next/navigation", () => ({
  usePathname: () => usePathname(),
}));

describe("SiteHeader", () => {
  beforeEach(() => usePathname.mockReturnValue("/trends"));

  it("renders exactly five report links and marks the active page", () => {
    render(<SiteHeader completedApps={98} totalApps={100} />);
    const navigation = screen.getByRole("navigation", { name: "Primary" });
    const links = Array.from(navigation.querySelectorAll("a"));
    expect(links.map((link) => link.textContent)).toEqual([
      "Overview", "Trends", "App Explorer", "Verification", "Methodology",
    ]);
    expect(screen.getByRole("link", { name: "Trends" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("98 / 100 reviewed")).toBeInTheDocument();
  });

  it("opens and closes the mobile navigation from the keyboard", async () => {
    const user = userEvent.setup();
    render(<SiteHeader completedApps={98} totalApps={100} />);
    const button = screen.getByRole("button", { name: "Open navigation" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    button.focus();
    await user.keyboard("{Enter}");
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(button).toHaveAccessibleName("Close navigation");
    await user.keyboard("{Enter}");
    expect(button).toHaveAttribute("aria-expanded", "false");
  });
});

describe("StatusBadge", () => {
  it("communicates status with text rather than color alone", () => {
    render(<StatusBadge tone="positive">Build now</StatusBadge>);
    expect(screen.getByText("Build now")).toHaveAttribute("data-tone", "positive");
  });
});
