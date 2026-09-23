import type { AppSort } from "@/lib/filters";
import type { ReportApp } from "@/lib/report-schema";
import { isCompletedApp } from "@/lib/report-schema";
import { humanizeKey } from "@/lib/selectors";
import { StatusBadge } from "./status-badge";

function verdictTone(value: string) {
  if (value === "build_now" || value === "complete") return "positive" as const;
  if (value === "blocked" || value === "failed") return "negative" as const;
  if (value === "conditional") return "warning" as const;
  return "neutral" as const;
}

function SortButton({ field, label, sort, onSort }: {
  field: AppSort["key"];
  label: string;
  sort: AppSort;
  onSort: (key: AppSort["key"]) => void;
}) {
  return (
    <button type="button" onClick={() => onSort(field)} aria-label={`Sort by ${label}`}>
      {label} {sort.key === field ? <span aria-hidden="true">{sort.direction === "asc" ? "↑" : "↓"}</span> : null}
    </button>
  );
}

export function AppTable({ apps, sort, onSort, onView }: {
  apps: readonly ReportApp[];
  sort: AppSort;
  onSort: (key: AppSort["key"]) => void;
  onView: (app: ReportApp, trigger: HTMLButtonElement) => void;
}) {
  return (
    <div className="table-wrap">
      <table className="app-table">
        <thead><tr>
          <th scope="col"><SortButton field="name" label="App" sort={sort} onSort={onSort} /></th>
          <th scope="col"><SortButton field="category" label="Category" sort={sort} onSort={onSort} /></th>
          <th scope="col">Authentication</th>
          <th scope="col">Access</th>
          <th scope="col"><SortButton field="buildability" label="Buildability" sort={sort} onSort={onSort} /></th>
          <th scope="col">Strict MCP</th>
          <th scope="col"><SortButton field="status" label="Status" sort={sort} onSort={onSort} /></th>
          <th scope="col"><span className="sr-only">Details</span></th>
        </tr></thead>
        <tbody>
          {apps.map((app) => {
            const complete = isCompletedApp(app);
            return (
              <tr key={app.id}>
                <th scope="row"><strong>{app.name}</strong><small>{app.website_hint}</small></th>
                <td>{app.category}</td>
                <td>{complete ? app.derived.authentication_families.join(", ") || "Unknown" : "—"}</td>
                <td>{complete ? humanizeKey(app.record.access.model) : "—"}</td>
                <td>{complete ? <StatusBadge tone={verdictTone(app.record.buildability.assessment)}>{humanizeKey(app.record.buildability.assessment)}</StatusBadge> : "—"}</td>
                <td>{complete ? humanizeKey(app.derived.strict_mcp_status) : "—"}</td>
                <td><StatusBadge tone={verdictTone(app.status)}>{humanizeKey(app.status)}</StatusBadge></td>
                <td><button className="table-action" type="button" onClick={(event) => onView(app, event.currentTarget)}>View <span className="sr-only">{app.name}</span></button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
