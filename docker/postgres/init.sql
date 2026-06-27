-- ─────────────────────────────────────────────────────────
-- EnglishEveryday — PostgreSQL Initialization Script
-- Runs once when the container is first created.
-- ─────────────────────────────────────────────────────────

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- fuzzy text search on vocab terms
CREATE EXTENSION IF NOT EXISTS "unaccent";   -- accent-insensitive search

-- Verify
DO $$
BEGIN
  RAISE NOTICE 'EnglishEveryday DB initialized with extensions: pgcrypto, pg_trgm, unaccent';
END
$$;
