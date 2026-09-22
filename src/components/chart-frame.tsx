import type { ReactNode } from "react";

export function ChartFrame({ title, takeaway, note, children }: {
  title: string;
  takeaway: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <figure className="chart-frame">
      <figcaption>
        <h3>{title}</h3>
        <p>{takeaway}</p>
      </figcaption>
      {children}
      {note ? <p className="chart-frame__note">{note}</p> : null}
    </figure>
  );
}
