# grillplatz-ch

Mobile-friendly web app to discover public grill sites ("Grillplätze" / Feuerstellen) across Switzerland. Filters by amenities (wood, tables, water, toilets), shows an interactive map, and links to Google Maps navigation.

## Tech stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS**
- **Leaflet / react-leaflet** (map)
- **Prisma** + **PostgreSQL + PostGIS** (database)

## Getting started

### 1. Prerequisites

- Node.js 18+
- PostgreSQL with the PostGIS extension enabled

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env.local
# Edit .env.local and set DATABASE_URL
```

### 4. Run database migrations

```bash
npx prisma migrate deploy
```

### 5. Import grill site data from OpenStreetMap

```bash
npm run import:overpass
```

This fetches all Swiss grill sites from the Overpass API and upserts them into the database (idempotent — safe to re-run).

### 6. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API

| Endpoint | Description |
|---|---|
| `GET /api/grillsites` | List sites. Params: `canton`, `lat`+`lon`+`radius_km`, `wood`, `tables`, `water`, `toilets` |
| `GET /api/grillsites/:id` | Full detail for one site |

## Data

Data is sourced from [OpenStreetMap](https://www.openstreetmap.org) via the Swiss [Overpass API](https://overpass.osm.ch). Licensed under [ODbL 1.0](https://opendatacommons.org/licenses/odbl/).

## Production setup

1. Set `DATABASE_URL` in your hosting environment.
2. Run `npx prisma migrate deploy` on first deploy.
3. Schedule `npm run import:overpass` nightly (cron / platform scheduler) to keep data fresh.
