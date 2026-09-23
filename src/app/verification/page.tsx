import type { Metadata } from "next";

import { CaseStudyCard } from "@/components/case-study-card";
import { Disclosure } from "@/components/disclosure";
import { MetricCard } from "@/components/metric-card";
import { PageIntro } from "@/components/page-intro";
import { VerificationBreakdown } from "@/components/verification-breakdown";
import { getReport } from "@/lib/report";
import type { CompletedReportApp, ReportApp } from "@/lib/report-schema";
import { completedApps } from "@/lib/selectors";

type IncompleteReportApp = Exclude<ReportApp, CompletedReportApp>;

export const metadata: Metadata = {
  title: "Verification",
  description: "Claim support, citation checks, corrections, human queues, and honest failure cases from the second-pass verifier.",
};

export default function VerificationPage() {
  const report = getReport();
  const totals = report.aggregates.verification;
  const corrections = report.aggregates.corrections;
  const completed = completedApps(report);
  const bySupport = [...completed].filter((app) => app.verification.metrics.support_rate !== null).sort((left, right) => (right.verification.metrics.support_rate ?? -1) - (left.verification.metrics.support_rate ?? -1) || left.name.localeCompare(right.name));
  const highest = bySupport[0];
  const lowest = bySupport.at(-1);
  const applied = completed.find((app) => app.verification.correction_summary.applied.length > 0);
  const rejected = completed.find((app) => app.verification.correction_summary.rejected.length > 0);
  const unavailable = [...completed].sort((left, right) => right.verification.metrics.unavailable_source_claims - left.verification.metrics.unavailable_source_claims || left.name.localeCompare(right.name))[0];
  const failed = report.apps.filter((app): app is IncompleteReportApp => app.status === "failed");
  const number = new Intl.NumberFormat("en-US");
  const citationTotal = totals.verified_original_citations + totals.unverified_original_citations;
  const citationRate = citationTotal ? Math.round((totals.verified_original_citations / citationTotal) * 100) : 0;

  return (
    <div className="report-page">
      <PageIntro eyebrow="Accuracy and audit" title={`${number.format(totals.supported_claims)} claims were supported—but support is not certainty.`} summary="The second pass decomposed every completed record into claims, independently searched the web, checked citations, proposed constrained corrections, and escalated ambiguity instead of hiding it." />

      <Disclosure title="What this rate means" tone="warning"><p>The {Math.round((totals.support_rate ?? 0) * 100)}% support rate is the verifier&apos;s evidence classification, not ground-truth accuracy. Human review remains necessary for unavailable sources, ambiguous claims, and rejected corrections.</p></Disclosure>

      <section className="section-block" aria-label="Claim outcomes">
        <div className="section-heading"><p className="eyebrow">Claim-level results</p><h2>{number.format(totals.checked_claims)} independently checked claims.</h2></div>
        <VerificationBreakdown checked={totals.checked_claims} supported={totals.supported_claims} contradicted={totals.contradicted_claims} insufficient={totals.insufficiently_supported_claims} unavailable={totals.unavailable_source_claims} />
      </section>

      <section className="verification-grid" aria-label="Citation and correction outcomes">
        <MetricCard label="Citation verification" value={`${citationRate}%`} detail={`${number.format(totals.verified_original_citations)} of ${number.format(citationTotal)} original citations`} tone="accent" />
        <article className="verification-summary"><p className="eyebrow">Correction layer</p><h2>{number.format(corrections.proposed)} proposed</h2><p>{number.format(corrections.applied)} applied · {number.format(corrections.rejected)} rejected · {number.format(corrections.unresolved)} unresolved</p></article>
        <article className="verification-summary"><p className="eyebrow">Human queue</p><h2>{number.format(totals.human_search_claims)} claims require human source search</h2><p>Unavailable sources are escalated rather than treated as supported.</p></article>
      </section>
      <p className="verification-caption">{citationRate}% of original citations were automatically verified as reachable and supporting.</p>

      <section className="section-block" aria-label="Verification case studies">
        <div className="section-heading"><p className="eyebrow">Honest examples</p><h2 id="case-study-heading">Where the loop succeeded—and where it stopped.</h2></div>
        <div className="case-study-grid">
          {highest ? <CaseStudyCard label="Highest support" app={highest.name} slug={highest.slug} tone="positive" detail={`${Math.round((highest.verification.metrics.support_rate ?? 0) * 100)}% of checked claims supported.`} /> : null}
          {lowest ? <CaseStudyCard label="Lowest support" app={lowest.name} slug={lowest.slug} tone="warning" detail={`${Math.round((lowest.verification.metrics.support_rate ?? 0) * 100)}% support; inspect insufficiencies before relying on the record.`} /> : null}
          {applied ? <CaseStudyCard label="Applied correction" app={applied.name} slug={applied.slug} tone="positive" detail={`${applied.verification.correction_summary.applied.length} verifier correction(s) passed the safe-edit constraints.`} /> : null}
          {rejected ? <CaseStudyCard label="Rejected correction" app={rejected.name} slug={rejected.slug} tone="warning" detail={`${rejected.verification.correction_summary.rejected.length} proposed correction(s) were rejected rather than applied unsafely.`} /> : null}
          {unavailable ? <CaseStudyCard label="Unavailable source" app={unavailable.name} slug={unavailable.slug} detail={`${unavailable.verification.metrics.unavailable_source_claims} claim source(s) could not be verified automatically.`} /> : null}
          {failed.map((app) => <CaseStudyCard key={app.slug} label="Pipeline exception" app={app.name} tone="negative" detail={app.errors[0]?.message ?? "The two-pass workflow did not complete."} />)}
        </div>
      </section>
    </div>
  );
}
