ALTER TABLE "grill_sites"
  ADD COLUMN IF NOT EXISTS "website"       TEXT,
  ADD COLUMN IF NOT EXISTS "description"   TEXT,
  ADD COLUMN IF NOT EXISTS "openingHours"  TEXT,
  ADD COLUMN IF NOT EXISTS "capacity"      INTEGER,
  ADD COLUMN IF NOT EXISTS "covered"       BOOLEAN,
  ADD COLUMN IF NOT EXISTS "fee"           BOOLEAN,
  ADD COLUMN IF NOT EXISTS "wheelchair"    TEXT,
  ADD COLUMN IF NOT EXISTS "operator"      TEXT,
  ADD COLUMN IF NOT EXISTS "access"        TEXT;
