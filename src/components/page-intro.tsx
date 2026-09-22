import type { ReactNode } from "react";

export function PageIntro({ eyebrow, title, summary, children }: {
  eyebrow: string;
  title: string;
  summary: string;
  children?: ReactNode;
}) {
  return (
    <header className="page-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="page-intro__summary">{summary}</p>
      {children ? <div className="page-intro__actions">{children}</div> : null}
    </header>
  );
}
