import { DiskCache } from '@src/disk-cache'

export let diskCache: DiskCache

export async function initializeDiskCache() {
  diskCache = await DiskCache.create()
}

export async function clearDiskCache() {
  diskCache.close()
}

interface IRawItem {
  key: string
  value: Buffer
  updated_at: number
  time_to_live: number | null
}

export function setRawItem(raw: IRawItem): void {
  diskCache._db.prepare(`
    INSERT INTO cache(
                  key
                , value
                , updated_at
                , time_to_live
                )
         VALUES ($key, $value, $updated_at, $time_to_live)
  `).run(raw)
}

export function getRawItem(key: string): IRawItem {
  return diskCache._db.prepare(`
    SELECT *
      FROM cache
     WHERE key = $key
  `).get({ key })
}

export function hasRawItem(key: string): boolean {
  const result: { item_exists: 1 | 0 } = diskCache._db.prepare(`
    SELECT EXISTS(
             SELECT *
               FROM cache
              WHERE key = $key
           ) AS item_exists
  `).get({ key })
  return result.item_exists === 1
}
