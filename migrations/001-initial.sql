--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

-- 在WAL模式下, better-sqlite3可充分发挥性能
PRAGMA journal_mode = WAL;

CREATE TABLE cache (
  key                  TEXT    NOT NULL UNIQUE
, value                BLOB    NOT NULL
, updated_at           INTEGER NOT NULL
, time_to_live         INTEGER NULL
) STRICT;

CREATE INDEX idx_cache_deletion_time
          ON cache(updated_at + time_to_live)
       WHERE time_to_live IS NOT NULL;

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

PRAGMA journal_mode = DELETE;

DROP TABLE cache;
