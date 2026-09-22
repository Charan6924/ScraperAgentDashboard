import Link from "next/link";

const sourceUrl = "https://github.com/Charan6924/ScraperAgent";

export function SiteFooter({ generatedAt, completedApps, totalApps }: {
  generatedAt: string;
  completedApps: number;
  totalApps: number;
}) {
  const formatted = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(generatedAt));

  return (
    <footer className="site-footer">
      <div className="page-frame site-footer__grid">
        <div>
          <p className="site-footer__title">Integration Index</p>
          <p>An evidence-led survey of API access, agent-toolkit buildability, and MCP availability.</p>
        </div>
        <div className="site-footer__meta">
          <p>{completedApps} of {totalApps} records reviewed</p>
          <p>Snapshot generated {formatted} UTC</p>
          <Link href={sourceUrl}>View research source</Link>
        </div>
      </div>
    </footer>
  );
}
