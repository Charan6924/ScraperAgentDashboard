import Link from "next/link";

import { ChartFrame } from "@/components/chart-frame";
import { Disclosure } from "@/components/disclosure";
import { DistributionBar } from "@/components/distribution-bar";
import { MetricCard } from "@/components/metric-card";
import { PageIntro } from "@/components/page-intro";
import { Workflow } from "@/components/workflow";
import { getReport } from "@/lib/report";
import { distributionRows, humanizeKey, topFinding } from "@/lib/selectors";

export default function Home() {
  const report = getReport();
  const { metadata, aggregates } = report;
  const reviewed = metadata.completed_apps;
  const buildabilityRows = distributionRows(aggregates.buildability).map((row) => ({ ...row, label: humanizeKey(row.label) }));
  const accessRows = distributionRows(aggregates.access_model).map((row) => ({ ...row, label: humanizeKey(row.label) }));
  const blockerRows = distributionRows(aggregates.blocker).filter((row) => row.label !== "none").slice(0, 5).map((row) => ({ ...row, label: humanizeKey(row.label) }));
  const authRows = distributionRows(aggregates.authentication, { multiSelect: true }).slice(0, 5);
  const dominantAuth = topFinding(aggregates.authentication);
  const dominantAccess = topFinding(aggregates.access_model);
  const dominantBlocker = topFinding(Object.fromEntries(Object.entries(aggregates.blocker).filter(([key]) => key !== "none")));
  const dominantInterface = topFinding(aggregates.interfaces);
  const number = new Intl.NumberFormat("en-US");

  return (
    <div className="overview-page">
      <PageIntro
        eyebrow="100-app research report"
        title={`${aggregates.buildability.build_now} integrations can be built now. Most of the rest need a manageable prerequisite.`}
        summary={`${metadata.completed_apps} of ${metadata.total_apps} apps completed. The dominant pattern is not missing APIs—it is usable APIs paired with approval, plan, or administrative constraints.`}
      >
        <Link className="button button--primary" href="/apps">Browse all apps</Link>
        <Link className="button" href="/trends">Explore trends</Link>
      </PageIntro>

      {!metadata.final_ready ? (
        <Disclosure title="Preliminary snapshot" tone="warning">
          <p>{metadata.failed_apps} apps failed the completed two-pass workflow and are disclosed but excluded from research denominators. Results below cover {reviewed} reviewed records.</p>
        </Disclosure>
      ) : null}

      <section className="section-block" aria-labelledby="verdict-heading">
        <div className="section-heading">
          <p className="eyebrow">Buildability verdict</p>
          <h2 id="verdict-heading">Nearly every reviewed app exposes enough surface to build something useful.</h2>
        </div>
        <div className="metric-grid metric-grid--four" aria-label="Buildability totals">
          <MetricCard label="Build now" value={aggregates.buildability.build_now} detail="Practical credential path" tone="positive" />
          <MetricCard label="Conditional" value={aggregates.buildability.conditional} detail="Manageable prerequisite" tone="warning" />
          <MetricCard label="Blocked" value={aggregates.buildability.blocked} detail="No practical route today" tone="negative" />
          <MetricCard label="Unknown" value={aggregates.buildability.unknown} detail="Evidence remains unclear" />
        </div>
      </section>

      <section className="section-block findings-grid" aria-labelledby="findings-heading">
        <div className="section-heading section-heading--sticky">
          <p className="eyebrow">What the data says</p>
          <h2 id="findings-heading">Four patterns shape the integration backlog.</h2>
          <p>Counts are app-level. Authentication and interface fields are multi-select, so their totals can exceed the {reviewed} reviewed apps.</p>
        </div>
        <ol className="findings-list" aria-label="Key findings">
          <li><span>01</span><div><strong>{dominantAuth?.label} dominates authentication.</strong><p>{dominantAuth?.value} apps document it, often alongside tokens or API keys.</p></div></li>
          <li><span>02</span><div><strong>{humanizeKey(dominantAccess?.label ?? "unknown")} access is the most common path.</strong><p>{dominantAccess?.value} apps combine self-serve development with a gate for broader or production use.</p></div></li>
          <li><span>03</span><div><strong>{humanizeKey(dominantBlocker?.label ?? "unknown")} is the leading stated blocker.</strong><p>{dominantBlocker?.value} reviewed apps require it as the main prerequisite in the buildability verdict.</p></div></li>
          <li><span>04</span><div><strong>{dominantInterface?.label} is the integration baseline.</strong><p>{dominantInterface?.value} apps expose it; public API absence is not the main constraint in this set.</p></div></li>
        </ol>
      </section>

      <section className="section-block" aria-labelledby="patterns-heading">
        <div className="section-heading">
          <p className="eyebrow">At a glance</p>
          <h2 id="patterns-heading">Access—not endpoint breadth—separates easy wins from outreach work.</h2>
        </div>
        <div className="chart-grid">
          <ChartFrame title="Buildability" takeaway="97 of 98 reviewed apps are buildable now or conditionally.">
            <DistributionBar rows={buildabilityRows} denominator={reviewed} />
          </ChartFrame>
          <ChartFrame title="Access model" takeaway="Mixed access narrowly leads fully self-service access.">
            <DistributionBar rows={accessRows} denominator={reviewed} />
          </ChartFrame>
          <ChartFrame title="Leading blockers" takeaway="Administrative approval is more common than a missing technical interface.">
            <DistributionBar rows={blockerRows} denominator={reviewed} />
          </ChartFrame>
          <ChartFrame title="Authentication" takeaway="OAuth dominates, but real toolkits often need more than one credential mode." note="Multi-select: one app may contribute to several rows.">
            <DistributionBar rows={authRows} denominator={reviewed} multiSelect />
          </ChartFrame>
        </div>
        <Link className="text-link" href="/trends">Explore trends</Link>
      </section>

      <section className="section-block verification-band" aria-labelledby="verification-heading">
        <div>
          <p className="eyebrow">Verification</p>
          <h2 id="verification-heading">{number.format(aggregates.verification.supported_claims)} of {number.format(aggregates.verification.checked_claims)} checked claims were supported.</h2>
          <p>Every completed record passed schema checks, claim decomposition, independent web research, and a constrained correction stage.</p>
        </div>
        <div>
          <MetricCard label="Support rate" value={`${Math.round((aggregates.verification.support_rate ?? 0) * 100)}%`} detail="LLM verifier classification" tone="accent" />
          <Disclosure title="Read this carefully">
            <p>Evidence support is not ground-truth accuracy. It measures whether the verifier judged each recorded claim to be supported by available sources.</p>
          </Disclosure>
        </div>
        <Link className="text-link" href="/verification">Review verification</Link>
      </section>

      <section className="section-block" aria-labelledby="workflow-heading">
        <div className="section-heading">
          <p className="eyebrow">The agent</p>
          <h2 id="workflow-heading">A two-pass workflow researched, challenged, and safely corrected each record.</h2>
        </div>
        <Workflow />
        <Link className="text-link" href="/methodology">Read methodology</Link>
      </section>
    </div>
  );
}
