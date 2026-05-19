import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import dynamic from "next/dynamic";

const MiniMap = dynamic(() => import("@/components/MiniMap"), { ssr: false });

async function getSite(id: string) {
  try {
    return await prisma.grillSite.findUnique({ where: { id } });
  } catch {
    return null;
  }
}

function AmenityRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: boolean | null | undefined;
}) {
  if (value === null || value === undefined) return null;
  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
      <span className="text-xl w-8 text-center">{icon}</span>
      <span className="text-sm text-gray-700 flex-1">{label}</span>
      <span
        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          value
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        {value ? "Ja" : "Nein"}
      </span>
    </div>
  );
}

export default async function SiteDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const site = await getSite(params.id);
  if (!site) notFound();

  const googleMapsUrl = `https://www.google.com/maps?q=${site.lat},${site.lon}`;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-brand-orange hover:underline"
        >
          ← Zurück zur Karte
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{site.name}</h1>
          {(site.canton || site.municipality) && (
            <p className="text-gray-500 mt-1">
              {[site.canton, site.municipality].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>

        {/* Mini map */}
        <div className="h-48 rounded-xl overflow-hidden border border-gray-200">
          <MiniMap lat={site.lat} lon={site.lon} name={site.name} />
        </div>

        {/* Google Maps link */}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 bg-brand-orange text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
        >
          📍 In Google Maps öffnen
        </a>

        {/* Amenities */}
        <div className="bg-white rounded-xl border border-gray-200 px-4 divide-y divide-gray-100">
          <h2 className="py-3 font-semibold text-gray-900 text-sm">Ausstattung</h2>
          {site.hasFirepit && (
            <div className="flex items-center gap-3 py-2">
              <span className="text-xl w-8 text-center">🔥</span>
              <span className="text-sm text-gray-700">Feuerstelle</span>
              <span className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Ja</span>
            </div>
          )}
          {site.hasBbqGrill && (
            <div className="flex items-center gap-3 py-2">
              <span className="text-xl w-8 text-center">🍖</span>
              <span className="text-sm text-gray-700">Grill</span>
              <span className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Ja</span>
            </div>
          )}
          <AmenityRow icon="🪵" label="Holz vorhanden" value={site.woodAvailable} />
          <AmenityRow icon="🪑" label="Picknicktische" value={site.picnicTables} />
          <AmenityRow icon="💧" label="Trinkwasser" value={site.drinkingWater} />
          <AmenityRow icon="🚻" label="Toiletten" value={site.toilets} />
          <AmenityRow icon="🛝" label="Spielplatz" value={site.playground} />
        </div>

        {/* Coordinates */}
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
          <h2 className="font-semibold text-gray-900 text-sm mb-2">Koordinaten</h2>
          <p className="text-sm text-gray-600 font-mono">
            {site.lat.toFixed(6)}, {site.lon.toFixed(6)}
          </p>
        </div>

        {/* Source info */}
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 text-xs text-gray-400 space-y-1">
          <p>
            Quelle:{" "}
            {site.sourcePrimary === "OSM"
              ? "OpenStreetMap"
              : site.sourcePrimary}
            {site.osmId && ` · ${site.osmId}`}
          </p>
          {site.lastAutoUpdateAt && (
            <p>
              Zuletzt aktualisiert:{" "}
              {new Date(site.lastAutoUpdateAt).toLocaleDateString("de-CH")}
            </p>
          )}
          <p>
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-600"
            >
              OpenStreetMap-Mitwirkende (ODbL 1.0)
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
