import type { Metadata } from "next";

import { AppExplorer } from "@/components/app-explorer";
import { PageIntro } from "@/components/page-intro";
import { getReport } from "@/lib/report";

export const metadata: Metadata = {
  title: "App Explorer",
  description: "Search and filter all 100 app research outcomes, then inspect claims, evidence, verification, and corrections.",
};

export default function AppsPage() {
  const report = getReport();
  return (
    <div className="report-page report-page--compact">
      <PageIntro eyebrow="Research index" title="Inspect every app, verdict, and source." summary="Filter the full 100-app set by access, authentication, API surface, MCP, buildability, verification confidence, or completion state." />
      <AppExplorer apps={report.apps} />
    </div>
  );
}
