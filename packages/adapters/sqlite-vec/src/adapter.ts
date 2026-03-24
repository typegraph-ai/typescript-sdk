import type { VectorStoreAdapter, SearchOpts } from '@d8um/core'
import type { EmbeddedChunk, ChunkFilter, ScoredChunk } from '@d8um/core'
import { SqliteHashStore } from './hash-store.js'

export interface SqliteVecAdapterConfig {
  dbPath?: string | undefined
}

export class SqliteVecAdapter implements VectorStoreAdapter {
  hashStore: SqliteHashStore

  /** model key → table name */
  private modelTables = new Map<string, string>()

  constructor(private config: SqliteVecAdapterConfig = {}) {
    // TODO: initialize better-sqlite3 + sqlite-vec extension
    this.hashStore = new SqliteHashStore(null)
  }

  async initialize(): Promise<void> {
    // TODO: create registry table, hash tables
    throw new Error('Not implemented')
  }

  async ensureModel(model: string, dimensions: number): Promise<void> {
    // TODO: create sqlite-vec virtual table for this model if not exists
    throw new Error('Not implemented')
  }

  async upsertDocument(model: string, chunks: EmbeddedChunk[]): Promise<void> { throw new Error('Not implemented') }
  async delete(model: string, filter: ChunkFilter): Promise<void> { throw new Error('Not implemented') }
  async search(model: string, embedding: number[], opts: SearchOpts): Promise<ScoredChunk[]> { throw new Error('Not implemented') }
  async countChunks(model: string, filter: ChunkFilter): Promise<number> { throw new Error('Not implemented') }
}
