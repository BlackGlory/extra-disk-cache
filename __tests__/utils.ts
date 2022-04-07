import { DiskCache } from '@src/disk-cache'
import { createTempDirSync, emptyDir } from 'extra-filesystem'
import { isObject } from '@blackglory/types'

const tmpDir = createTempDirSync()
export let diskCache: DiskCache

export async function initializeDiskCache() {
  diskCache = await DiskCache.create(tmpDir)
}

export async function clearDiskCache() {
  await diskCache.close()
  await emptyDir(tmpDir)
}

interface IRawMetadata {
  key: string
  updated_at: number
  time_to_live: number | null
  time_before_deletion: number | null
}

export async function setRawData(key: string, data: Buffer): Promise<void> {
  await diskCache._data.put(key, Buffer.from(data))
}

export function setRawMetadata(raw: IRawMetadata): void {
  diskCache._metadata.prepare(`
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
  return await diskCache._data.get(key)
}

export function getRawMetadata(key: string): IRawMetadata {
  return diskCache._metadata.prepare(`
    SELECT *
      FROM cache_metadata
     WHERE key = $key
  `).get({ key })
}

export async function hasRawData(key: string): Promise<boolean> {
  try {
    await diskCache._data.get(key)
    return true
  } catch (err) {
    if (isObject(err) && err.notFound) return false
    throw err
  }
}

export function hasRawMetadata(key: string): boolean {
  const result: { metadata_exists: 1 | 0 } = diskCache._metadata.prepare(`
    SELECT EXISTS(
             SELECT *
               FROM cache_metadata
              WHERE key = $key
           ) AS metadata_exists
  `).get({ key })
  return result.metadata_exists === 1
}
