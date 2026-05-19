export interface GrillSiteSummary {
  id: string;
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
}

export interface GrillSiteDetail extends GrillSiteSummary {
  osmId: string | null;
  sourcePrimary: "OSM" | "POI_SCHWEIZ" | "CURATED";
  sourceSecondary: string | null;
  lastAutoUpdateAt: string | null;
  lastManualUpdateAt: string | null;
  status: "active" | "closed" | "suspect";
  googleMapsUrl: string;
}

export interface FilterState {
  canton: string;
  wood: boolean;
  tables: boolean;
  water: boolean;
  toilets: boolean;
}
