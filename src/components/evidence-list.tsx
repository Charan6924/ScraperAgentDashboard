import type { CompletedReportApp } from "@/lib/report-schema";

type Evidence = CompletedReportApp["record"]["description"]["evidence"][number];

export function EvidenceList({ evidence }: { evidence: readonly Evidence[] }) {
  if (!evidence.length) return <p className="empty-note">No evidence attached.</p>;
  return (
    <ul className="evidence-list">
      {evidence.map((item, index) => (
        <li key={`${item.url}-${index}`}>
          <div>
            <strong>{item.page_title ?? new URL(item.url).hostname}</strong>
            <a href={item.url} target="_blank" rel="noopener noreferrer">Open source <span aria-hidden="true">↗</span></a>
          </div>
          <blockquote>{item.excerpt}</blockquote>
          {item.retrieved_at ? <small>Retrieved {item.retrieved_at}</small> : null}
        </li>
      ))}
    </ul>
  );
}
