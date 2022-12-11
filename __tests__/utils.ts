import { DiskCache } from '@src/disk-cache'

interface IRawItem {
  key: string
  value: Buffer
  updated_at: number
  time_to_live: number | null
}

export function setRawItem(cache: DiskCache, raw: IRawItem): void {
  cache._db.prepare(`
    INSERT INTO cache(
                  key
                , value
                , updated_at
                , time_to_live
                )
         VALUES ($key, $value, $updated_at, $time_to_live)
             ON CONFLICT(key)
             DO UPDATE SET value = $value
                         , updated_at = $updated_at
                         , time_to_live = $time_to_live
  `).run(raw)
}

export function getRawItem(cache: DiskCache, key: string): IRawItem {
  return cache._db.prepare(`
    SELECT *
      FROM cache
     WHERE key = $key
  `).get({ key })
}

export function hasRawItem(cache: DiskCache, key: string): boolean {
  const result: { item_exists: 1 | 0 } = cache._db.prepare(`
    SELECT EXISTS(
             SELECT *
               FROM cache
              WHERE key = $key
           ) AS item_exists
  `).get({ key })
  return result.item_exists === 1
}
