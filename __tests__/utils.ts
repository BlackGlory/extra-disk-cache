import { DiskCache } from '@src/disk-cache'
import { createTempDirSync, emptyDir } from 'extra-filesystem'
import { isRecord } from '@blackglory/types'

const tmpDir = createTempDirSync()
export let diskCache: DiskCacheTest

class DiskCacheTest extends DiskCache {
  getLevel() {
    return this.data
  }

  getSQLite() {
    return this.metadata
  }
}

export async function initializeDiskCache() {
  diskCache = new DiskCacheTest(tmpDir)
  await diskCache.prepare()
}

export async function clearDiskCache() {
  await diskCache.close()
  await emptyDir(tmpDir)
}

interface IRawMetadata {
  key: string
  updated_at: number
  time_to_live: number
  time_before_deletion?: number
}

export async function setRawData(key: string, data: Buffer): Promise<void> {
  await diskCache.getLevel().put(key, Buffer.from(data))
}

export function setRawMetadata(raw: IRawMetadata): void {
  diskCache.getSQLite().prepare(`
    INSERT INTO cache_metadata(
                  key
                , updated_at
                , time_to_live
                , time_before_deletion
                )
         VALUES ($key, $updated_at, $time_to_live, $time_before_deletion)
  `).run(raw)
}

export async function getRawData(key: string): Promise<Buffer> {
  return await diskCache.getLevel().get(key)
}

export function getRawMetadata(key: string): IRawMetadata {
  return diskCache.getSQLite().prepare(`
    SELECT *
      FROM cache_metadata
     WHERE key = $key
  `).get({ key })
}

export async function hasRawData(key: string): Promise<boolean> {
  try {
    await diskCache.getLevel().get(key)
    return true
  } catch (err) {
    if (isRecord(err) && err.notFound) return false
    throw err
  }
}

export function hasRawMetadata(key: string): boolean {
  const result: { metadata_exists: 1 | 0 } = diskCache.getSQLite().prepare(`
    SELECT EXISTS(
             SELECT *
               FROM cache_metadata
              WHERE key = $key
           ) AS metadata_exists
  `).get({ key })
  return result.metadata_exists === 1
}
