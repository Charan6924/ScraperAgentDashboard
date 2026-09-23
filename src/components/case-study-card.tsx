import Link from "next/link";

export function CaseStudyCard({ label, app, detail, slug, tone = "neutral" }: {
  label: string;
  app: string;
  detail: string;
  slug?: string;
  tone?: "positive" | "warning" | "negative" | "neutral";
}) {
  return (
    <article className="case-study-card" data-tone={tone}>
      <p className="eyebrow">{label}</p>
      <h3>{app}</h3>
      <p>{detail}</p>
      {slug ? <Link href={`/apps?app=${slug}`}>Inspect record</Link> : null}
    </article>
  );
}
