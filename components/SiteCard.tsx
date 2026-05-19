import Link from "next/link";
import { GrillSiteSummary } from "@/lib/types";

interface SiteCardProps {
  site: GrillSiteSummary;
  selected?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

export function AmenityIcon({
  value,
  label,
}: {
  value: boolean | null;
  label: string;
}) {
  if (value === null || value === undefined) return null;
  return (
    <span
      className={`text-xs px-1.5 py-0.5 rounded ${
        value
          ? "bg-green-100 text-green-800"
          : "bg-gray-100 text-gray-400 line-through"
      }`}
    >
      {label}
    </span>
  );
}

export default function SiteCard({
  site,
  selected,
  onClick,
  compact,
}: SiteCardProps) {
  return (
    <div
      onClick={onClick}
      className={`p-3 border-b border-gray-100 cursor-pointer transition-colors ${
        selected ? "bg-orange-50 border-l-4 border-l-brand-orange" : "hover:bg-gray-50"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-sm text-gray-900 truncate">
            {site.name}
          </p>
          {!compact && (
            <p className="text-xs text-gray-500 mt-0.5">
              {[site.canton, site.municipality].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
        <Link
          href={`/sites/${site.id}`}
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 text-xs text-brand-orange hover:underline"
        >
          Details
        </Link>
      </div>

      <div className="flex flex-wrap gap-1 mt-2">
        {site.hasFirepit && (
          <span className="text-xs bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded">
            🔥 Feuerstelle
          </span>
        )}
        {site.hasBbqGrill && (
          <span className="text-xs bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded">
            🍖 Grill
          </span>
        )}
        <AmenityIcon value={site.woodAvailable} label="🪵 Holz" />
        <AmenityIcon value={site.picnicTables} label="🪑 Tisch" />
        <AmenityIcon value={site.drinkingWater} label="💧 Wasser" />
        <AmenityIcon value={site.toilets} label="🚻 WC" />
        <AmenityIcon value={site.playground} label="🛝 Spielplatz" />
      </div>
    </div>
  );
}
