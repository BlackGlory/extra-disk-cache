--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

-- 在WAL模式下, better-sqlite3可充分发挥性能
PRAGMA journal_mode = WAL;

CREATE TABLE cache (
  key             TEXT    NOT NULL UNIQUE
, value           BLOB    NOT NULL
, expiration_time INTEGER NULL -- 表示过期时间的JavaScript时间戳
) STRICT;

CREATE INDEX idx_cache_expiration_time
          ON cache(expiration_time)
       WHERE expiration_time IS NOT NULL;

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

PRAGMA journal_mode = DELETE;

DROP TABLE cache;
