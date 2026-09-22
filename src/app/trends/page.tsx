import type { Metadata } from "next";

import { CategoryBars } from "@/components/category-bars";
import { Disclosure } from "@/components/disclosure";
import { PageIntro } from "@/components/page-intro";
import { TrendSection } from "@/components/trend-section";
import { getReport } from "@/lib/report";
import { categoryMatrix, completedApps, distributionRows, humanizeKey } from "@/lib/selectors";

export const metadata: Metadata = {
  title: "Trends",
  description: "Authentication, access, buildability, blocker, interface, and MCP patterns across the app research set.",
};

function OverallTotals({ counts, keys }: { counts: Readonly<Record<string, number>>; keys?: string[] }) {
  const rows = distributionRows(counts);
  const ordered = keys ? keys.map((key) => rows.find((row) => row.label === key) ?? { label: key, value: 0 }) : rows;
  return (
    <ul className="trend-totals" aria-label="Overall totals">
      {ordered.map((row) => <li key={row.label}><span>{humanizeKey(row.label)}</span><strong>{row.value}</strong></li>)}
    </ul>
  );
}

export default function TrendsPage() {
  const report = getReport();
  const apps = completedApps(report);
  const auth = categoryMatrix(apps, (app) => app.derived.authentication_families);
  const access = categoryMatrix(apps, (app) => [app.record.access.model]);
  const plan = categoryMatrix(apps, (app) => [app.record.access.plan.value]);
  const buildability = categoryMatrix(apps, (app) => [app.record.buildability.assessment]);
  const interfaces = categoryMatrix(apps, (app) => app.derived.interfaces);
  const strictMcp = categoryMatrix(apps, (app) => [app.derived.strict_mcp_status]);

  const clusterStats = apps.reduce<Record<string, { buildNow: number; outreach: number; total: number }>>((stats, app) => {
    const row = stats[app.category] ?? { buildNow: 0, outreach: 0, total: 0 };
    row.total += 1;
    if (app.record.buildability.assessment === "build_now") row.buildNow += 1;
    if (app.record.access.gates.some((gate) => ["partnership", "contact_sales", "app_review"].includes(gate.type))) row.outreach += 1;
    stats[app.category] = row;
    return stats;
  }, {});
  const easyWins = Object.entries(clusterStats).sort((a, b) => b[1].buildNow - a[1].buildNow || a[0].localeCompare(b[0])).slice(0, 3);
  const outreach = Object.entries(clusterStats).sort((a, b) => b[1].outreach - a[1].outreach || a[0].localeCompare(b[0])).slice(0, 3);

  return (
    <div className="report-page">
      <PageIntro
        eyebrow="Cross-app patterns"
        title="Access constraints matter more than missing technical surface."
        summary="REST is nearly universal and OAuth is common, but administrative approval, reviews, and mixed access paths determine which integrations are immediate wins."
      />

      <Disclosure title="How to read these charts">
        <p>Authentication and interface charts use multi-select counts: one app may appear in several values. Category rows show exact app counts, not mutually exclusive percentages.</p>
      </Disclosure>

      <TrendSection id="authentication" title="Authentication" takeaway="OAuth 2.0 leads across the set, frequently paired with tokens or API keys." note="Multi-select counts; totals can exceed 98.">
        <OverallTotals counts={report.aggregates.authentication} />
        <CategoryBars rows={auth} keys={["OAuth 2.0", "API key", "Token", "Basic auth"]} />
      </TrendSection>

      <TrendSection id="access-model" title="Access model" takeaway="Mixed paths slightly outnumber fully self-service integrations: developer access can be easy while production access is gated.">
        <OverallTotals counts={report.aggregates.access_model} keys={["self_service", "mixed", "gated", "unknown"]} />
        <CategoryBars rows={access} keys={["self_service", "mixed", "gated", "unknown"]} />
      </TrendSection>

      <TrendSection id="plan-path" title="Plan path" takeaway="Free access is common, yet plan evidence remains unknown for a meaningful minority.">
        <OverallTotals counts={report.aggregates.plan} />
        <CategoryBars rows={plan} keys={["free_available", "trial_available", "paid_required", "enterprise_required", "unknown"]} />
      </TrendSection>

      <TrendSection id="buildability" title="Buildability" takeaway="Only one reviewed app is blocked; the real decision is build now versus build after a prerequisite.">
        <OverallTotals counts={report.aggregates.buildability} keys={["build_now", "conditional", "blocked", "unknown"]} />
        <CategoryBars rows={buildability} keys={["build_now", "conditional", "blocked", "unknown"]} />
      </TrendSection>

      <TrendSection id="primary-blockers" title="Primary blockers" takeaway="Admin approval and paid-plan requirements lead the prerequisite list; missing public APIs do not.">
        <OverallTotals counts={report.aggregates.blocker} />
      </TrendSection>

      <TrendSection id="api-interfaces" title="API interfaces" takeaway="REST is the baseline, while webhooks and SDKs expand useful agent workflows." note="Multi-select counts; CLI and SDK presence is not automatically a public API.">
        <OverallTotals counts={report.aggregates.interfaces} />
        <CategoryBars rows={interfaces} keys={["REST", "GraphQL", "Webhooks", "SDK", "CLI"]} />
      </TrendSection>

      <TrendSection id="strict-mcp" title="Strict MCP availability" takeaway="Verified MCP implementations exist for more than half the reviewed set, but ownership varies." note="Strict status requires GitHub, docs, and direct MCP evidence; hosted claims without all three are excluded.">
        <OverallTotals counts={report.aggregates.strict_mcp} keys={["official", "community", "none_found", "unknown"]} />
        <CategoryBars rows={strictMcp} keys={["official", "community", "none_found", "unknown"]} />
      </TrendSection>

      <TrendSection id="where-to-start" title="Where to start" takeaway="Prioritize categories with high build-now counts; reserve review- and partnership-heavy clusters for outreach in parallel.">
        <div className="cluster-grid">
          <article><p className="eyebrow">Easy wins</p><h3>Highest build-now volume</h3><ol>{easyWins.map(([category, value]) => <li key={category}><span>{category}</span><strong>{value.buildNow} build now</strong></li>)}</ol></article>
          <article><p className="eyebrow">Outreach-dependent</p><h3>Most review, sales, or partnership gates</h3><ol>{outreach.map(([category, value]) => <li key={category}><span>{category}</span><strong>{value.outreach} gated</strong></li>)}</ol></article>
        </div>
      </TrendSection>
    </div>
  );
}
