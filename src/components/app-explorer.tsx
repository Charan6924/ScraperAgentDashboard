"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";

import { filterApps, filterOptions, sortApps, type AppSort, type FilterKey, type FilterState } from "@/lib/filters";
import type { ReportApp } from "@/lib/report-schema";
import { AppDrawer } from "./app-drawer";
import { AppTable } from "./app-table";
import { FilterBar } from "./filter-bar";

export function AppExplorer({ apps }: { apps: readonly ReportApp[] }) {
  const [state, setState] = useState<FilterState>({ search: "", filters: {} });
  const [sort, setSort] = useState<AppSort>({ key: "name", direction: "asc" });
  const returnFocus = useRef<HTMLButtonElement | null>(null);
  const options = useMemo(() => filterOptions(apps), [apps]);
  const results = useMemo(() => sortApps(filterApps(apps, state), sort), [apps, sort, state]);
  const selectedSlug = useSyncExternalStore(
    (notify) => {
      window.addEventListener("popstate", notify);
      window.addEventListener("app-selection", notify);
      return () => {
        window.removeEventListener("popstate", notify);
        window.removeEventListener("app-selection", notify);
      };
    },
    () => new URLSearchParams(window.location.search).get("app"),
    () => null,
  );
  const selected = selectedSlug ? apps.find((app) => app.slug === selectedSlug) ?? null : null;

  function updateFilter(key: FilterKey, value: string) {
    setState((current) => ({ ...current, filters: { ...current.filters, [key]: [...new Set([...(current.filters[key] ?? []), value])] } }));
  }

  function removeFilter(key: FilterKey, value: string) {
    setState((current) => ({ ...current, filters: { ...current.filters, [key]: (current.filters[key] ?? []).filter((item) => item !== value) } }));
  }

  function openApp(app: ReportApp, trigger: HTMLButtonElement) {
    returnFocus.current = trigger;
    const url = new URL(window.location.href);
    url.searchParams.set("app", app.slug);
    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
    window.dispatchEvent(new Event("app-selection"));
  }

  function closeApp() {
    const url = new URL(window.location.href);
    url.searchParams.delete("app");
    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
    window.dispatchEvent(new Event("app-selection"));
    returnFocus.current?.focus();
  }

  function changeSort(key: AppSort["key"]) {
    setSort((current) => ({ key, direction: current.key === key && current.direction === "asc" ? "desc" : "asc" }));
  }

  return (
    <div className="app-explorer">
      <FilterBar
        state={state}
        options={options}
        onSearch={(search) => setState((current) => ({ ...current, search }))}
        onAdd={updateFilter}
        onRemove={removeFilter}
        onClear={() => setState({ search: "", filters: {} })}
      />
      <div className="results-heading"><strong>{results.length} {results.length === 1 ? "result" : "results"}</strong><span>of {apps.length} apps</span></div>
      {results.length ? <AppTable apps={results} sort={sort} onSort={changeSort} onView={openApp} /> : <div className="empty-state"><h2>No apps match those filters.</h2><p>Remove a filter or try a broader search.</p></div>}
      {selected ? <AppDrawer app={selected} onClose={closeApp} /> : null}
    </div>
  );
}
