--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

-- 在WAL模式下, better-sqlite3可充分发挥性能
PRAGMA journal_mode = WAL;

CREATE TABLE cache_metadata (
  key                  TEXT     NOT NULL UNIQUE
, updated_at           DATETIME NOT NULL
, time_to_live         INTEGER  NOT NULL
, time_before_deletion INTEGER  NULL
);

CREATE INDEX idx_cache_metadata_deletion_time
          ON cache_metadata(updated_at + time_to_live + time_before_deletion)
       WHERE time_before_deletion IS NOT NULL;

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

PRAGMA journal_mode = DELETE;

DROP TABLE cache_metadata;
