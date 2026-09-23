import type { FilterKey, FilterState } from "@/lib/filters";
import { filterKeys } from "@/lib/filters";
import { humanizeKey } from "@/lib/selectors";

const labels: Record<FilterKey, string> = {
  category: "Category",
  authentication: "Authentication",
  access: "Access model",
  plan: "Plan",
  gate: "Access gate",
  interface: "API interface",
  strict_mcp: "MCP status",
  buildability: "Buildability",
  blocker: "Blocker",
  confidence: "Confidence",
  status: "Status",
};

export function FilterBar({ state, options, onSearch, onAdd, onRemove, onClear }: {
  state: FilterState;
  options: Record<FilterKey, string[]>;
  onSearch: (search: string) => void;
  onAdd: (key: FilterKey, value: string) => void;
  onRemove: (key: FilterKey, value: string) => void;
  onClear: () => void;
}) {
  const active = filterKeys.flatMap((key) => (state.filters[key] ?? []).map((value) => ({ key, value })));
  return (
    <div className="filter-panel">
      <label className="search-field">
        <span>Search apps</span>
        <input type="search" value={state.search} onChange={(event) => onSearch(event.target.value)} placeholder="Name, category, or website" />
      </label>
      <div className="filter-grid">
        {filterKeys.map((key) => (
          <label key={key}>
            <span>{labels[key]}</span>
            <select aria-label={labels[key]} value="" onChange={(event) => event.target.value && onAdd(key, event.target.value)}>
              <option value="">All</option>
              {options[key].map((value) => <option key={value} value={value}>{humanizeKey(value)}</option>)}
            </select>
          </label>
        ))}
      </div>
      {active.length || state.search ? (
        <div className="active-filters" aria-label="Active filters">
          {active.map(({ key, value }) => (
            <button key={`${key}-${value}`} type="button" onClick={() => onRemove(key, value)} aria-label={`Remove ${labels[key]}: ${humanizeKey(value)}`}>
              {labels[key]}: {humanizeKey(value)} <span aria-hidden="true">×</span>
            </button>
          ))}
          <button className="active-filters__clear" type="button" onClick={onClear}>Clear all filters</button>
        </div>
      ) : null}
    </div>
  );
}
