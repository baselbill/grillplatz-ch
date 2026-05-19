"use client";

import { useEffect, useRef } from "react";
import { GrillSiteSummary } from "@/lib/types";
import SiteCard from "./SiteCard";

interface SiteListProps {
  sites: GrillSiteSummary[];
  selectedId: string | null;
  onSelect: (site: GrillSiteSummary) => void;
  loading?: boolean;
}

function SkeletonCard() {
  return (
    <div className="px-4 py-3 border-b border-gray-100 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
    </div>
  );
}

export default function SiteList({ sites, selectedId, onSelect, loading }: SiteListProps) {
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (selectedId && itemRefs.current[selectedId]) {
      itemRefs.current[selectedId]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedId]);

  if (loading && sites.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (sites.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm p-8 text-center">
        Keine Grillplätze gefunden. Filter anpassen oder anderen Standort wählen.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {sites.map((site) => (
        <div
          key={site.id}
          ref={(el) => {
            itemRefs.current[site.id] = el;
          }}
        >
          <SiteCard
            site={site}
            selected={site.id === selectedId}
            onClick={() => onSelect(site)}
          />
        </div>
      ))}
    </div>
  );
}
