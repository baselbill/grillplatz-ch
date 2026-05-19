import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const site = await prisma.grillSite.findUnique({
    where: { id: params.id },
  });

  if (!site) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...site,
    googleMapsUrl: `https://www.google.com/maps?q=${site.lat},${site.lon}`,
    lastAutoUpdateAt: site.lastAutoUpdateAt?.toISOString() ?? null,
    lastManualUpdateAt: site.lastManualUpdateAt?.toISOString() ?? null,
  });
}
