import type { Report, ReportApp } from "./report-schema";
import { isCompletedApp } from "./report-schema";

export type DistributionRow = {
  label: string;
  value: number;
  detail?: string;
};

export function formatRate(numerator: number, denominator: number): string {
  if (denominator <= 0) return "—";
  return `${Math.round((numerator / denominator) * 100)}%`;
}

export function distributionRows(
  counts: Readonly<Record<string, number>>,
  options: { multiSelect?: boolean } = {},
): DistributionRow[] {
  return Object.entries(counts)
    .map(([label, value]) => ({
      label,
      value,
      ...(options.multiSelect ? { detail: `${value} ${value === 1 ? "app" : "apps"} · multi-select` } : {}),
    }))
    .sort((left, right) => right.value - left.value || left.label.localeCompare(right.label));
}

export function topFinding(counts: Readonly<Record<string, number>>): DistributionRow | null {
  return distributionRows(counts)[0] ?? null;
}

export function categoryBreakdown(apps: ReadonlyArray<Pick<ReportApp, "category" | "status">>): Record<string, number> {
  return [...apps]
    .filter((app) => app.status === "complete")
    .sort((left, right) => left.category.localeCompare(right.category))
    .reduce<Record<string, number>>((totals, app) => {
      totals[app.category] = (totals[app.category] ?? 0) + 1;
      return totals;
    }, {});
}

export function completedApps(report: Report) {
  return report.apps.filter(isCompletedApp);
}

export function humanizeKey(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
