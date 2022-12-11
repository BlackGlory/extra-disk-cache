-- 在WAL模式下, better-sqlite3可充分发挥性能
PRAGMA journal_mode = WAL;

CREATE TABLE cache (
  key          TEXT    NOT NULL UNIQUE
, value        BLOB    NOT NULL
  -- 一些来自其他项目的需求需要知道缓存插入/更新的时间, 因此该列是不可删除的
, updated_at   INTEGER NOT NULL
, time_to_live INTEGER NULL
) STRICT;

CREATE INDEX idx_cache_expiration_time
          ON cache(updated_at + time_to_live)
       WHERE time_to_live IS NOT NULL;
