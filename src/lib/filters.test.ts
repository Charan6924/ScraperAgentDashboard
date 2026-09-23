import { describe, expect, it } from "vitest";

import { getReport } from "./report";
import { filterApps, parseFilterState, sortApps, type FilterState } from "./filters";

const apps = getReport().apps;
const empty: FilterState = { search: "", filters: {} };

describe("filterApps", () => {
  it("searches case-insensitively and can return an empty result", () => {
    expect(filterApps(apps, { ...empty, search: "tWeNtY" }).map((app) => app.name)).toEqual(["Twenty"]);
    expect(filterApps(apps, { ...empty, search: "definitely-not-an-app" })).toEqual([]);
  });

  it("combines dimensions with AND and values within one dimension with OR", () => {
    const result = filterApps(apps, {
      search: "",
      filters: { status: ["failed", "pending"], category: ["Ecommerce", "Marketing, Ads, Email and Social"] },
    });
    expect(result.map((app) => app.name).sort()).toEqual(["Klaviyo", "fanbasis"]);
  });

  it("filters normalized strict MCP and confidence fields", () => {
    const result = filterApps(apps, {
      search: "",
      filters: { strict_mcp: ["official"], confidence: ["high"], status: ["complete"] },
    });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((app) => app.status === "complete" && app.derived.strict_mcp_status === "official" && app.derived.confidence_band === "high")).toBe(true);
  });

  it("ignores unknown filter values from query state", () => {
    expect(filterApps(apps, { search: "", filters: { category: ["not-real"] } })).toHaveLength(100);
    expect(parseFilterState(new URLSearchParams("category=not-real&status=failed"), apps)).toEqual({
      search: "",
      filters: { status: ["failed"] },
    });
  });
});

describe("sortApps", () => {
  it("sorts stably in both directions", () => {
    const source = apps.slice(0, 4);
    const ascending = sortApps(source, { key: "name", direction: "asc" });
    const descending = sortApps(source, { key: "name", direction: "desc" });
    expect(ascending.map((app) => app.name)).toEqual([...source].map((app) => app.name).sort((a, b) => a.localeCompare(b)));
    expect(descending.map((app) => app.name)).toEqual([...ascending].reverse().map((app) => app.name));
    expect(source.map((app) => app.id)).toEqual(apps.slice(0, 4).map((app) => app.id));
  });
});
