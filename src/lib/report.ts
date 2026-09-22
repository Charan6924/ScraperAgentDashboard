import rawReport from "@/data/report.json";

import { reportSchema, type Report } from "./report-schema";

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) {
      deepFreeze(child);
    }
  }
  return value;
}

const report = deepFreeze(reportSchema.parse(rawReport));

export function getReport(): Report {
  return report;
}
