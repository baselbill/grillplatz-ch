-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('OSM', 'POI_SCHWEIZ', 'CURATED');

-- CreateEnum
CREATE TYPE "SiteStatus" AS ENUM ('active', 'closed', 'suspect');

-- CreateTable
CREATE TABLE "grill_sites" (
    "id" TEXT NOT NULL,
    "osmId" TEXT,
    "name" TEXT NOT NULL,
    "canton" TEXT,
    "municipality" TEXT,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "hasFirepit" BOOLEAN NOT NULL DEFAULT false,
    "hasBbqGrill" BOOLEAN NOT NULL DEFAULT false,
    "woodAvailable" BOOLEAN,
    "picnicTables" BOOLEAN,
    "drinkingWater" BOOLEAN,
    "toilets" BOOLEAN,
    "playground" BOOLEAN,
    "sourcePrimary" "SourceType" NOT NULL DEFAULT 'OSM',
    "sourceSecondary" TEXT,
    "lastAutoUpdateAt" TIMESTAMP(3),
    "lastManualUpdateAt" TIMESTAMP(3),
    "status" "SiteStatus" NOT NULL DEFAULT 'active',
    "rawTags" JSONB,

    CONSTRAINT "grill_sites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "grill_sites_osmId_key" ON "grill_sites"("osmId");

-- CreateIndex
CREATE INDEX "grill_sites_canton_idx" ON "grill_sites"("canton");

CREATE INDEX "grill_sites_status_idx" ON "grill_sites"("status");

-- PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

ALTER TABLE "grill_sites"
  ADD COLUMN IF NOT EXISTS "geog" geography(Point, 4326)
  GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint("lon", "lat"), 4326)::geography) STORED;

CREATE INDEX "grill_sites_geog_idx" ON "grill_sites" USING GIST ("geog");
