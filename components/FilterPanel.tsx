"use client";

import { FilterState } from "@/lib/types";

const SWISS_CANTONS = [
  "AG", "AI", "AR", "BE", "BL", "BS", "FR", "GE", "GL", "GR",
  "JU", "LU", "NE", "NW", "OW", "SG", "SH", "SO", "SZ", "TG",
  "TI", "UR", "VD", "VS", "ZG", "ZH",
];

interface FilterPanelProps {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  siteCount: number;
  loading: boolean;
}

export default function FilterPanel({
  filters,
  onChange,
  siteCount,
  loading,
}: FilterPanelProps) {
  function toggle(key: keyof Omit<FilterState, "canton">) {
    onChange({ ...filters, [key]: !filters[key] });
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <FilterChip
          label="🪵 Holz"
          active={filters.wood}
          onClick={() => toggle("wood")}
        />
        <FilterChip
          label="🪑 Tisch"
          active={filters.tables}
          onClick={() => toggle("tables")}
        />
        <FilterChip
          label="💧 Wasser"
          active={filters.water}
          onClick={() => toggle("water")}
        />
        <FilterChip
          label="🚻 WC"
          active={filters.toilets}
          onClick={() => toggle("toilets")}
        />

        <select
          value={filters.canton}
          onChange={(e) => onChange({ ...filters, canton: e.target.value })}
          className="text-sm border border-gray-300 rounded-full px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
        >
          <option value="">Alle Kantone</option>
          {SWISS_CANTONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs text-gray-500">
        {loading
          ? "Laden…"
          : `${siteCount} Grillplatz${siteCount !== 1 ? "¨e" : ""} gefunden`}
      </p>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-sm rounded-full px-3 py-1.5 border transition-colors ${
        active
          ? "bg-brand-orange text-white border-brand-orange"
          : "bg-white text-gray-700 border-gray-300 hover:border-brand-orange"
      }`}
    >
      {label}
    </button>
  );
}
