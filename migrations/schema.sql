-- 在WAL模式下, better-sqlite3可充分发挥性能
PRAGMA journal_mode = WAL;

CREATE TABLE cache_metadata (
  key                  TEXT    NOT NULL UNIQUE
, updated_at           INTEGER NOT NULL
, time_to_live         INTEGER NULL
, time_before_deletion INTEGER NULL
) STRICT;

CREATE INDEX idx_cache_metadata_deletion_time
          ON cache_metadata(updated_at + time_to_live + time_before_deletion)
       WHERE time_to_live IS NOT NULL
         AND time_before_deletion IS NOT NULL;
