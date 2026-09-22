import { humanizeKey } from "@/lib/selectors";

type CategoryRow = { category: string; total: number; values: Record<string, number> };

export function CategoryBars({ rows, keys }: { rows: CategoryRow[]; keys: string[] }) {
  return (
    <div className="category-bars">
      <div className="category-bars__legend" aria-label="Legend">
        {keys.map((key) => <span key={key}><i aria-hidden="true" />{humanizeKey(key)}</span>)}
      </div>
      <ul aria-label="Category breakdown">
        {rows.map((row) => (
          <li key={row.category}>
            <div className="category-bars__name"><strong>{row.category}</strong><small>{row.total} reviewed</small></div>
            <div className="category-bars__values">
              {keys.map((key) => (
                <span key={key} title={`${humanizeKey(key)}: ${row.values[key] ?? 0}`}>
                  <b>{row.values[key] ?? 0}</b><small>{humanizeKey(key)}</small>
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
