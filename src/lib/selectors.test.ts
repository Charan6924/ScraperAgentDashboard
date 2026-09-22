import { describe, expect, it } from "vitest";

import { categoryBreakdown, distributionRows, formatRate, topFinding } from "./selectors";

describe("formatRate", () => {
  it("uses an em dash for a zero denominator", () => {
    expect(formatRate(0, 0)).toBe("—");
  });

  it("formats a count as a rounded percentage", () => {
    expect(formatRate(87, 100)).toBe("87%");
    expect(formatRate(2, 3)).toBe("67%");
  });
});

describe("distributionRows", () => {
  it("sorts by count and preserves alphabetical ordering for ties", () => {
    expect(distributionRows({ Token: 1, OAuth: 2, "API key": 2 })).toEqual([
      { label: "API key", value: 2 },
      { label: "OAuth", value: 2 },
      { label: "Token", value: 1 },
    ]);
  });

  it("can label multi-select dimensions without inventing a share", () => {
    expect(distributionRows({ OAuth: 2, Token: 2 }, { multiSelect: true })[0]).toEqual({
      label: "OAuth",
      value: 2,
      detail: "2 apps · multi-select",
    });
  });
});

describe("topFinding", () => {
  it("uses stable tie ordering and handles an empty distribution", () => {
    expect(topFinding({ Token: 2, OAuth: 2 })).toEqual({ label: "OAuth", value: 2 });
    expect(topFinding({})).toBeNull();
  });
});

describe("categoryBreakdown", () => {
  it("excludes incomplete apps and returns deterministic category values", () => {
    const apps = [
      { category: "B", status: "complete" as const },
      { category: "A", status: "failed" as const },
      { category: "B", status: "complete" as const },
      { category: "A", status: "complete" as const },
    ];
    expect(categoryBreakdown(apps)).toEqual({ A: 1, B: 2 });
  });
});
