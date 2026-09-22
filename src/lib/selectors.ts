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

export function categoryMatrix<T extends { category: string; status: string }>(
  apps: ReadonlyArray<T>,
  valuesFor: (app: T) => ReadonlyArray<string>,
): Array<{ category: string; total: number; values: Record<string, number> }> {
  const buckets = new Map<string, { total: number; values: Record<string, number> }>();

  for (const app of apps) {
    if (app.status !== "complete") continue;
    const bucket = buckets.get(app.category) ?? { total: 0, values: {} };
    bucket.total += 1;
    for (const value of new Set(valuesFor(app))) {
      bucket.values[value] = (bucket.values[value] ?? 0) + 1;
    }
    buckets.set(app.category, bucket);
  }

  return [...buckets.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([category, bucket]) => ({
      category,
      total: bucket.total,
      values: Object.fromEntries(Object.entries(bucket.values).sort(([left], [right]) => left.localeCompare(right))),
    }));
}

export function completedApps(report: Report) {
  return report.apps.filter(isCompletedApp);
}

export function humanizeKey(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
