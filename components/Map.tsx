"use client";

import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { GrillSiteSummary } from "@/lib/types";
import Link from "next/link";

// Fix default icon paths broken by webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const woodIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  className: "marker-wood",
});

const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  className: "marker-default",
});

function MapFlyTo({
  center,
  zoom,
}: {
  center: [number, number] | null;
  zoom?: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom ?? 13, { duration: 1 });
    }
  }, [center, zoom, map]);
  return null;
}

interface MapProps {
  sites: GrillSiteSummary[];
  selectedId: string | null;
  onSelectSite: (site: GrillSiteSummary) => void;
  flyTo: [number, number] | null;
  userLocation: { lat: number; lon: number } | null;
}

export default function Map({
  sites,
  selectedId,
  onSelectSite,
  flyTo,
  userLocation,
}: MapProps) {
  const popupRefs = useRef<Record<string, L.Marker | null>>({});

  useEffect(() => {
    if (selectedId && popupRefs.current[selectedId]) {
      popupRefs.current[selectedId]?.openPopup();
    }
  }, [selectedId]);

  return (
    <MapContainer
      center={[46.8, 8.3]}
      zoom={8}
      className="h-full w-full"
      attributionControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapFlyTo center={flyTo} />

      {userLocation && (
        <Marker
          position={[userLocation.lat, userLocation.lon]}
          icon={
            new L.Icon({
              iconUrl:
                "data:image/svg+xml;utf8," +
                encodeURIComponent(
                  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6" width="24" height="24"><circle cx="12" cy="12" r="8" fill="#3b82f6" stroke="white" stroke-width="2"/></svg>`
                ),
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            })
          }
        >
          <Popup>Dein Standort</Popup>
        </Marker>
      )}

      <MarkerClusterGroup chunkedLoading>
        {sites.map((site) => (
          <Marker
            key={site.id}
            position={[site.lat, site.lon]}
            icon={site.woodAvailable ? woodIcon : defaultIcon}
            ref={(m) => {
              popupRefs.current[site.id] = m;
            }}
            eventHandlers={{ click: () => onSelectSite(site) }}
          >
            <Popup>
              <div className="min-w-[180px]">
                <p className="font-semibold text-sm">{site.name}</p>
                {site.canton && (
                  <p className="text-xs text-gray-500">{site.canton}</p>
                )}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {site.hasFirepit && <Badge label="🔥 Feuer" />}
                  {site.hasBbqGrill && <Badge label="🍖 Grill" />}
                  {site.woodAvailable && <Badge label="🪵 Holz" />}
                  {site.picnicTables && <Badge label="🪑 Tisch" />}
                  {site.drinkingWater && <Badge label="💧 Wasser" />}
                  {site.toilets && <Badge label="🚻 WC" />}
                </div>
                <div className="flex gap-2 mt-2">
                  <Link
                    href={`/sites/${site.id}`}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Details →
                  </Link>
                  <a
                    href={`https://www.google.com/maps?q=${site.lat},${site.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-700 hover:underline"
                  >
                    Google Maps →
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="text-xs bg-orange-100 text-orange-800 px-1 py-0.5 rounded">
      {label}
    </span>
  );
}
