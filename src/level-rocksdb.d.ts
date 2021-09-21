declare module 'level-rocksdb' {
  import { EventEmitter } from 'events'

  type Operation = { type: 'del'; key: string }

  export default function level<T>(
    location: string
  , options?: {
      keyEncoding?: string
      valueEncoding?: string
    }
  ): ILevel<T>

  interface ILevel<T> {
    open(): Promise<void>
    close(): Promise<void>
    put(key: string, value: T): Promise<void>
    get(key: string): Promise<T>
    del(key: string): Promise<void>
    batch(array: Operation[]): Promise<void>

    // rocksdb支持此方法, 但由于文档缺乏维护, 没有写出来:
    // https://github.com/Level/community/issues/79
    // 虽然文档可能在日后修复, 但考虑到level生态系统没有被积极维护的事实, 特此注释.
    clear(): Promise<void>

    createKeyStream(options?: {
      gte?: string
      lte?: string
      limit?: number
    }): EventEmitter
  }
}
