"use client";

import { useEffect, useRef } from "react";
import { GrillSiteSummary } from "@/lib/types";
import SiteCard from "./SiteCard";

interface SiteListProps {
  sites: GrillSiteSummary[];
  selectedId: string | null;
  onSelect: (site: GrillSiteSummary) => void;
}

export default function SiteList({ sites, selectedId, onSelect }: SiteListProps) {
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (selectedId && itemRefs.current[selectedId]) {
      itemRefs.current[selectedId]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedId]);

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
