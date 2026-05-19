"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { FilterState, GrillSiteSummary } from "@/lib/types";
import FilterPanel from "@/components/FilterPanel";
import SiteList from "@/components/SiteList";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

const DEFAULT_FILTERS: FilterState = {
  canton: "",
  wood: false,
  tables: false,
  water: false,
  toilets: false,
};

export default function HomePage() {
  const [sites, setSites] = useState<GrillSiteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [selectedSite, setSelectedSite] = useState<GrillSiteSummary | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [flyTo, setFlyTo] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [listOpen, setListOpen] = useState(false);

  const fetchSites = useCallback(
    async (
      f: FilterState,
      loc: { lat: number; lon: number } | null,
      radiusKm = 20
    ) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (f.canton) params.set("canton", f.canton);
        if (f.wood) params.set("wood", "true");
        if (f.tables) params.set("tables", "true");
        if (f.water) params.set("water", "true");
        if (f.toilets) params.set("toilets", "true");
        if (loc) {
          params.set("lat", String(loc.lat));
          params.set("lon", String(loc.lon));
          params.set("radius_km", String(radiusKm));
        }
        const res = await fetch(`/api/grillsites?${params}`);
        const data: GrillSiteSummary[] = await res.json();
        setSites(data);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchSites(filters, userLocation);
  }, [filters, userLocation, fetchSites]);

  function handleLocate() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setUserLocation(loc);
        setFlyTo([loc.lat, loc.lon]);
        setLocating(false);
      },
      () => setLocating(false)
    );
  }

  function handleSelectSite(site: GrillSiteSummary) {
    setSelectedSite(site);
    setFlyTo([site.lat, site.lon]);
    setListOpen(false);
  }

  return (
    <div className="flex h-full relative">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col w-80 shrink-0 bg-white border-r border-gray-200 z-10">
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          siteCount={sites.length}
          loading={loading}
        />
        <SiteList
          sites={sites}
          selectedId={selectedSite?.id ?? null}
          onSelect={handleSelectSite}
        />
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <Map
          sites={sites}
          selectedId={selectedSite?.id ?? null}
          onSelectSite={handleSelectSite}
          flyTo={flyTo}
          userLocation={userLocation}
        />

        {/* Locate button */}
        <button
          onClick={handleLocate}
          disabled={locating}
          className="absolute top-3 right-3 z-[1000] bg-white shadow-md rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
        >
          {locating ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <span>📍</span>
          )}
          Mein Standort
        </button>

        {/* Mobile: toggle list button */}
        <button
          onClick={() => setListOpen((o) => !o)}
          className="md:hidden absolute bottom-20 left-1/2 -translate-x-1/2 z-[1000] bg-brand-orange text-white shadow-lg rounded-full px-5 py-2.5 text-sm font-medium"
        >
          {listOpen ? "Karte" : `Liste (${sites.length})`}
        </button>
      </div>

      {/* Mobile bottom sheet */}
      {listOpen && (
        <div className="md:hidden absolute inset-0 z-[2000] bg-white flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h2 className="font-semibold text-gray-900">Grillplätze</h2>
            <button
              onClick={() => setListOpen(false)}
              className="text-gray-500 text-sm"
            >
              ✕ Schliessen
            </button>
          </div>
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            siteCount={sites.length}
            loading={loading}
          />
          <SiteList
            sites={sites}
            selectedId={selectedSite?.id ?? null}
            onSelect={handleSelectSite}
          />
        </div>
      )}
    </div>
  );
}
