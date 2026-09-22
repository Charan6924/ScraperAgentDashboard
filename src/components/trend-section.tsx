import type { ReactNode } from "react";

export function TrendSection({ id, title, takeaway, note, children }: {
  id: string;
  title: string;
  takeaway: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section className="trend-section" aria-labelledby={id}>
      <div className="trend-section__intro">
        <p className="eyebrow">Pattern</p>
        <h2 id={id}>{title}</h2>
        <p>{takeaway}</p>
        {note ? <small>{note}</small> : null}
      </div>
      <div className="trend-section__content">{children}</div>
    </section>
  );
}
