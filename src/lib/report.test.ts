import { describe, expect, it } from "vitest";

import { getReport } from "./report";

describe("getReport", () => {
  it("validates and freezes the committed 100-app snapshot", () => {
    const report = getReport();
    expect(report.metadata.total_apps).toBe(100);
    expect(report.apps).toHaveLength(100);
    expect(report.metadata.completed_apps).toBeGreaterThan(0);
    expect(Object.isFrozen(report)).toBe(true);
    expect(Object.isFrozen(report.apps)).toBe(true);
  });
});
