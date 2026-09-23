import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { getReport } from "@/lib/report";
import { AppExplorer } from "./app-explorer";

const apps = getReport().apps;

describe("AppExplorer", () => {
  beforeEach(() => window.history.replaceState({}, "", "/apps"));

  it("searches, filters, shows active chips, resets, and handles empty results", async () => {
    const user = userEvent.setup();
    render(<AppExplorer apps={apps} />);
    expect(screen.getByText("100 results")).toBeInTheDocument();
    await user.type(screen.getByRole("searchbox", { name: "Search apps" }), "Twenty");
    expect(screen.getByText("1 result")).toBeInTheDocument();
    expect(screen.getByRole("row", { name: /Twenty/ })).toBeInTheDocument();
    await user.clear(screen.getByRole("searchbox", { name: "Search apps" }));
    await user.selectOptions(screen.getByRole("combobox", { name: "Status" }), "failed");
    expect(screen.getByRole("button", { name: "Remove Status: Failed" })).toBeInTheDocument();
    expect(screen.getByText("2 results")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear all filters" }));
    expect(screen.getByText("100 results")).toBeInTheDocument();
    await user.type(screen.getByRole("searchbox", { name: "Search apps" }), "no-such-product");
    expect(screen.getByText(/No apps match/i)).toBeInTheDocument();
  });

  it("sorts from keyboard-accessible column controls", async () => {
    const user = userEvent.setup();
    render(<AppExplorer apps={apps.slice(0, 4)} />);
    const sort = screen.getByRole("button", { name: /sort by app/i });
    sort.focus();
    await user.keyboard("{Enter}");
    const rows = screen.getAllByRole("row").slice(1);
    expect(within(rows[0]).getByRole("button", { name: /view/i })).toHaveAccessibleName(/Salesforce/i);
  });

  it("opens a complete evidence drawer, closes it, and restores focus", async () => {
    const user = userEvent.setup();
    render(<AppExplorer apps={apps} />);
    await user.type(screen.getByRole("searchbox", { name: "Search apps" }), "Salesforce");
    const trigger = screen.getByRole("button", { name: "View Salesforce" });
    await user.click(trigger);
    const drawer = screen.getByRole("dialog", { name: "Salesforce research details" });
    expect(drawer).toHaveTextContent("Authentication");
    expect(drawer).toHaveTextContent("API surface");
    expect(drawer).toHaveTextContent("Verification");
    const evidence = within(drawer).getAllByRole("link", { name: /open source/i })[0];
    expect(evidence).toHaveAttribute("target", "_blank");
    expect(evidence).toHaveAttribute("rel", expect.stringContaining("noreferrer"));
    await user.click(within(drawer).getByRole("button", { name: "Close details" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("opens a known query-selected app and ignores an unknown slug", async () => {
    window.history.replaceState({}, "", "/apps?app=twenty");
    const { unmount } = render(<AppExplorer apps={apps} />);
    expect(await screen.findByRole("dialog", { name: "Twenty research details" })).toBeInTheDocument();
    unmount();
    window.history.replaceState({}, "", "/apps?app=not-real");
    render(<AppExplorer apps={apps} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
