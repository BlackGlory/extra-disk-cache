--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------
CREATE TABLE new_cache_metadata (
  key                  TEXT    NOT NULL UNIQUE
, updated_at           INTEGER NOT NULL
, time_to_live         INTEGER NOT NULL
, time_before_deletion INTEGER NULL
) STRICT;

INSERT INTO new_cache_metadata (
  key
, updated_at
, time_to_live
, time_before_deletion
)
SELECT key
     , updated_at
     , time_to_live
     , time_before_deletion
  FROM cache_metadata;

ALTER TABLE cache_metadata
RENAME TO old_cache_metadata;

ALTER TABLE new_cache_metadata
RENAME TO cache_metadata;

DROP TABLE old_cache_metadata;

CREATE INDEX idx_cache_metadata_deletion_time
          ON cache_metadata(updated_at + time_to_live + time_before_deletion)
       WHERE time_before_deletion IS NOT NULL;

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------
CREATE TABLE new_cache_metadata (
  key                  TEXT     NOT NULL UNIQUE
, updated_at           DATETIME NOT NULL
, time_to_live         INTEGER  NOT NULL
, time_before_deletion INTEGER  NULL
);

INSERT INTO new_cache_metadata (
  key
, updated_at
, time_to_live
, time_before_deletion
)
SELECT key
     , updated_at
     , time_to_live
     , time_before_deletion
  FROM cache_metadata;

ALTER TABLE cache_metadata
RENAME TO old_cache_metadata;

ALTER TABLE new_cache_metadata
RENAME TO cache_metadata;

DROP TABLE old_cache_metadata;

CREATE INDEX idx_cache_metadata_deletion_time
          ON cache_metadata(updated_at + time_to_live + time_before_deletion)
       WHERE time_before_deletion IS NOT NULL;
