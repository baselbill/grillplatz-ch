import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const OVERPASS_URL = "https://overpass.osm.ch/api/interpreter";

const QUERY = `
[out:json][timeout:180];
area["ISO3166-1"="CH"][admin_level=2]->.ch;
(
  nwr["leisure"="firepit"](area.ch);
  nwr["amenity"="bbq"](area.ch);
  nwr["tourism"="picnic_site"]["bbq"~"^(yes|fire)$"](area.ch);
  nwr["tourism"="picnic_site"]["firepit"="yes"](area.ch);
);
out center tags;
`.trim();

interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

function tag(tags: Record<string, string>, key: string): string | undefined {
  return tags[key];
}

function tagIs(
  tags: Record<string, string>,
  key: string,
  value: string
): boolean {
  return tags[key] === value;
}

function deriveName(tags: Record<string, string>, osmId: string): string {
  return (
    tags["name"] ||
    tags["name:de"] ||
    tags["name:fr"] ||
    tags["ref"] ||
    `OSM ${osmId}`
  );
}

function deriveCantonFromTags(
  tags: Record<string, string>
): string | undefined {
  const addr =
    tags["addr:state"] ||
    tags["is_in:state_code"] ||
    tags["addr:canton"] ||
    tags["is_in:canton"];
  if (addr) return addr.replace(/^CH-/i, "");
  return undefined;
}

function mapElement(el: OverpassElement): {
  osmId: string;
  name: string;
  canton: string | null;
  municipality: string | null;
  lat: number;
  lon: number;
  hasFirepit: boolean;
  hasBbqGrill: boolean;
  woodAvailable: boolean | null;
  picnicTables: boolean | null;
  drinkingWater: boolean | null;
  toilets: boolean | null;
  playground: boolean | null;
  website: string | null;
  description: string | null;
  openingHours: string | null;
  capacity: number | null;
  covered: boolean | null;
  fee: boolean | null;
  wheelchair: string | null;
  operator: string | null;
  access: string | null;
  rawTags: Record<string, string>;
} | null {
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (lat === undefined || lon === undefined) return null;

  const tags = el.tags ?? {};
  const osmId = `${el.type}/${el.id}`;

  const hasFirepit =
    tagIs(tags, "leisure", "firepit") ||
    tagIs(tags, "firepit", "yes") ||
    tagIs(tags, "openfire", "yes");

  const hasBbqGrill =
    tagIs(tags, "amenity", "bbq") ||
    tagIs(tags, "bbq", "yes") ||
    tagIs(tags, "bbq", "fire");

  const woodAvailable =
    tag(tags, "wood") !== undefined || tag(tags, "fuel:wood") !== undefined
      ? tagIs(tags, "wood", "yes") || tagIs(tags, "fuel:wood", "yes")
      : null;

  const picnicTables =
    tag(tags, "picnic_table") !== undefined
      ? tagIs(tags, "picnic_table", "yes")
      : null;

  const drinkingWater =
    tag(tags, "drinking_water") !== undefined
      ? tagIs(tags, "drinking_water", "yes")
      : null;

  const toilets =
    tag(tags, "toilets") !== undefined ? tagIs(tags, "toilets", "yes") : null;

  const playground =
    tag(tags, "playground") !== undefined
      ? tagIs(tags, "playground", "yes")
      : null;

  const website = tags["website"] ?? tags["contact:website"] ?? null;
  const description = tags["description"] ?? tags["description:de"] ?? null;
  const openingHours = tags["opening_hours"] ?? null;

  const rawCapacity = tags["capacity"];
  const capacity = rawCapacity ? (isNaN(parseInt(rawCapacity)) ? null : parseInt(rawCapacity)) : null;

  const covered =
    tag(tags, "covered") !== undefined
      ? tagIs(tags, "covered", "yes")
      : null;

  const feeTag = tags["fee"];
  const fee =
    feeTag === "yes" ? true : feeTag === "no" ? false : null;

  const wheelchair = tags["wheelchair"] ?? null;
  const operator = tags["operator"] ?? null;
  const access = tags["access"] ?? null;

  return {
    osmId,
    name: deriveName(tags, osmId),
    canton: deriveCantonFromTags(tags) ?? null,
    municipality: tags["addr:city"] ?? tags["is_in:city"] ?? null,
    lat,
    lon,
    hasFirepit,
    hasBbqGrill,
    woodAvailable,
    picnicTables,
    drinkingWater,
    toilets,
    playground,
    website,
    description,
    openingHours,
    capacity,
    covered,
    fee,
    wheelchair,
    operator,
    access,
    rawTags: tags,
  };
}

async function fetchOverpass(): Promise<OverpassResponse> {
  console.log("Fetching from Overpass API…");
  const params = new URLSearchParams({ data: QUERY });
  const res = await fetch(`${OVERPASS_URL}?${params}`, {
    headers: { "User-Agent": "grillplatz-ch/1.0" },
  });
  if (!res.ok) {
    throw new Error(`Overpass request failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<OverpassResponse>;
}

const BATCH_SIZE = 100;

async function main() {
  const data = await fetchOverpass();
  const elements = data.elements;
  console.log(`Received ${elements.length} elements from Overpass`);

  const mappedElements: NonNullable<ReturnType<typeof mapElement>>[] = [];
  let skipped = 0;

  for (const el of elements) {
    const mapped = mapElement(el);
    if (!mapped) {
      skipped++;
      continue;
    }
    mappedElements.push(mapped);
  }

  const now = new Date();
  let upserted = 0;

  for (let i = 0; i < mappedElements.length; i += BATCH_SIZE) {
    const batch = mappedElements.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map((mapped) =>
        prisma.grillSite.upsert({
          where: { osmId: mapped.osmId },
          create: {
            osmId: mapped.osmId,
            name: mapped.name,
            canton: mapped.canton,
            municipality: mapped.municipality,
            lat: mapped.lat,
            lon: mapped.lon,
            hasFirepit: mapped.hasFirepit,
            hasBbqGrill: mapped.hasBbqGrill,
            woodAvailable: mapped.woodAvailable,
            picnicTables: mapped.picnicTables,
            drinkingWater: mapped.drinkingWater,
            toilets: mapped.toilets,
            playground: mapped.playground,
            website: mapped.website,
            description: mapped.description,
            openingHours: mapped.openingHours,
            capacity: mapped.capacity,
            covered: mapped.covered,
            fee: mapped.fee,
            wheelchair: mapped.wheelchair,
            operator: mapped.operator,
            access: mapped.access,
            sourcePrimary: "OSM",
            lastAutoUpdateAt: now,
            rawTags: mapped.rawTags,
          },
          update: {
            name: mapped.name,
            canton: mapped.canton,
            municipality: mapped.municipality,
            lat: mapped.lat,
            lon: mapped.lon,
            hasFirepit: mapped.hasFirepit,
            hasBbqGrill: mapped.hasBbqGrill,
            woodAvailable: mapped.woodAvailable,
            picnicTables: mapped.picnicTables,
            drinkingWater: mapped.drinkingWater,
            toilets: mapped.toilets,
            playground: mapped.playground,
            website: mapped.website,
            description: mapped.description,
            openingHours: mapped.openingHours,
            capacity: mapped.capacity,
            covered: mapped.covered,
            fee: mapped.fee,
            wheelchair: mapped.wheelchair,
            operator: mapped.operator,
            access: mapped.access,
            lastAutoUpdateAt: now,
            rawTags: mapped.rawTags,
          },
        })
      )
    );
    upserted += batch.length;
    process.stdout.write(`\r  Upserted: ${upserted} / ${mappedElements.length}`);
  }

  // Mark OSM sites missing from this fetch as suspect
  const fetchedOsmIds = new Set(mappedElements.map((m) => m.osmId));
  const activeOsmSites = await prisma.grillSite.findMany({
    where: { sourcePrimary: "OSM", status: "active" },
    select: { osmId: true },
  });
  const suspectIds = activeOsmSites
    .filter((s) => s.osmId && !fetchedOsmIds.has(s.osmId))
    .map((s) => s.osmId as string);

  if (suspectIds.length > 0) {
    await prisma.grillSite.updateMany({
      where: { osmId: { in: suspectIds } },
      data: { status: "suspect" },
    });
    console.log(`\nMarked ${suspectIds.length} sites as suspect (no longer in Overpass)`);
  }

  console.log(
    `\nDone. Upserted: ${upserted}, skipped (no coords): ${skipped}`
  );
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});
