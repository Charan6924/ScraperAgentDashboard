import type { ReportApp } from "./report-schema";
import { isCompletedApp } from "./report-schema";

export const filterKeys = [
  "category", "authentication", "access", "plan", "gate", "interface",
  "strict_mcp", "buildability", "blocker", "confidence", "status",
] as const;

export type FilterKey = typeof filterKeys[number];
export type FilterState = { search: string; filters: Partial<Record<FilterKey, string[]>> };
export type AppSort = { key: "name" | "category" | "status" | "buildability"; direction: "asc" | "desc" };

function valuesForApp(app: ReportApp, key: FilterKey): string[] {
  if (key === "category") return [app.category];
  if (key === "status") return [app.status];
  if (!isCompletedApp(app)) return [];
  switch (key) {
    case "authentication": return app.derived.authentication_families;
    case "access": return [app.record.access.model];
    case "plan": return [app.record.access.plan.value];
    case "gate": return app.record.access.gates.length ? app.record.access.gates.map((gate) => gate.type) : ["none_recorded"];
    case "interface": return app.derived.interfaces;
    case "strict_mcp": return [app.derived.strict_mcp_status];
    case "buildability": return [app.record.buildability.assessment];
    case "blocker": return [app.record.blocker?.category ?? "none"];
    case "confidence": return [app.derived.confidence_band];
  }
}

export function filterOptions(apps: readonly ReportApp[]): Record<FilterKey, string[]> {
  return Object.fromEntries(filterKeys.map((key) => [
    key,
    [...new Set(apps.flatMap((app) => valuesForApp(app, key)))].sort((left, right) => left.localeCompare(right)),
  ])) as Record<FilterKey, string[]>;
}

export function filterApps(apps: readonly ReportApp[], state: FilterState): ReportApp[] {
  const known = filterOptions(apps);
  const search = state.search.trim().toLocaleLowerCase();
  return apps.filter((app) => {
    if (search && !`${app.name} ${app.category} ${app.website_hint}`.toLocaleLowerCase().includes(search)) return false;
    return filterKeys.every((key) => {
      const selected = (state.filters[key] ?? []).filter((value) => known[key].includes(value));
      if (!selected.length) return true;
      const values = valuesForApp(app, key);
      return selected.some((value) => values.includes(value));
    });
  });
}

function sortValue(app: ReportApp, key: AppSort["key"]): string {
  if (key === "buildability") return isCompletedApp(app) ? app.record.buildability.assessment : "zz_incomplete";
  return app[key];
}

export function sortApps(apps: readonly ReportApp[], sort: AppSort): ReportApp[] {
  const multiplier = sort.direction === "asc" ? 1 : -1;
  return apps
    .map((app, index) => ({ app, index }))
    .sort((left, right) => {
      const comparison = sortValue(left.app, sort.key).localeCompare(sortValue(right.app, sort.key));
      return comparison ? comparison * multiplier : left.index - right.index;
    })
    .map(({ app }) => app);
}

export function parseFilterState(params: URLSearchParams, apps: readonly ReportApp[]): FilterState {
  const known = filterOptions(apps);
  const filters: FilterState["filters"] = {};
  for (const key of filterKeys) {
    const values = params.getAll(key).flatMap((value) => value.split(",")).filter((value) => known[key].includes(value));
    if (values.length) filters[key] = [...new Set(values)];
  }
  return { search: params.get("q") ?? "", filters };
}
