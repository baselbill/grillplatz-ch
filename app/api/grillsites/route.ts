import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const SUMMARY_SELECT = {
  id: true,
  name: true,
  canton: true,
  municipality: true,
  lat: true,
  lon: true,
  hasFirepit: true,
  hasBbqGrill: true,
  woodAvailable: true,
  picnicTables: true,
  drinkingWater: true,
  toilets: true,
  playground: true,
} as const;

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  const canton = sp.get("canton") || undefined;
  const latStr = sp.get("lat");
  const lonStr = sp.get("lon");
  const radiusStr = sp.get("radius_km");
  const wood = sp.get("wood");
  const tables = sp.get("tables");
  const water = sp.get("water");
  const toilets = sp.get("toilets");
  const covered = sp.get("covered");

  const hasRadius = latStr && lonStr && radiusStr;

  if (hasRadius) {
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);
    const radiusM = parseFloat(radiusStr) * 1000;

    if (isNaN(lat) || isNaN(lon) || isNaN(radiusM)) {
      return NextResponse.json(
        { error: "Invalid lat/lon/radius_km" },
        { status: 400 }
      );
    }

    const conditions: Prisma.Sql[] = [
      Prisma.sql`status = 'active'`,
      Prisma.sql`ST_DWithin(geog, ST_MakePoint(${lon}, ${lat})::geography, ${radiusM})`,
    ];
    if (canton) conditions.push(Prisma.sql`canton = ${canton}`);
    if (wood === "true") conditions.push(Prisma.sql`"woodAvailable" = true`);
    if (tables === "true") conditions.push(Prisma.sql`"picnicTables" = true`);
    if (water === "true") conditions.push(Prisma.sql`"drinkingWater" = true`);
    if (toilets === "true") conditions.push(Prisma.sql`toilets = true`);
    if (covered === "true") conditions.push(Prisma.sql`covered = true`);

    const whereClause = Prisma.join(conditions, " AND ");
    const sql = Prisma.sql`
      SELECT id, name, canton, municipality, lat, lon,
             "hasFirepit", "hasBbqGrill", "woodAvailable",
             "picnicTables", "drinkingWater", toilets, playground
      FROM grill_sites
      WHERE ${whereClause}
      ORDER BY ST_Distance(geog, ST_MakePoint(${lon}, ${lat})::geography)
      LIMIT 300
    `;

    const rows = await prisma.$queryRaw(sql);
    return NextResponse.json(rows);
  }

  // Standard Prisma query (no radius)
  const where: Prisma.GrillSiteWhereInput = { status: "active" };
  if (canton) where.canton = canton;
  if (wood === "true") where.woodAvailable = true;
  if (tables === "true") where.picnicTables = true;
  if (water === "true") where.drinkingWater = true;
  if (toilets === "true") where.toilets = true;
  if (covered === "true") where.covered = true;

  const sites = await prisma.grillSite.findMany({
    where,
    select: SUMMARY_SELECT,
    orderBy: { name: "asc" },
    take: 1000,
  });

  return NextResponse.json(sites);
}
