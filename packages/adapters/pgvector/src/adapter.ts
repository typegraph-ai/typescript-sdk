import type { VectorStoreAdapter, SearchOpts } from '@d8um/core'
import type { EmbeddedChunk, ChunkFilter, ScoredChunk } from '@d8um/core'
import { REGISTRY_SQL, MODEL_TABLE_SQL, HASH_TABLE_SQL, sanitizeModelKey } from './migrations.js'
import { PgHashStore } from './hash-store.js'

export interface PgVectorAdapterConfig {
  connectionString: string
  tablePrefix?: string | undefined
  hashesTable?: string | undefined
}

export class PgVectorAdapter implements VectorStoreAdapter {
  private sql: any
  readonly hashStore: PgHashStore
  private tablePrefix: string
  private hashesTable: string
  private registryTable: string

  /** model key → table name */
  private modelTables = new Map<string, string>()

  constructor(private config: PgVectorAdapterConfig) {
    this.tablePrefix = config.tablePrefix ?? 'd8um_chunks'
    this.hashesTable = config.hashesTable ?? 'd8um_hashes'
    this.registryTable = `${this.tablePrefix}_registry`
    // TODO: initialize neon() or pg Pool from connectionString
    this.hashStore = new PgHashStore(this.sql, this.hashesTable)
  }

  async initialize(): Promise<void> {
    await this.sql(`CREATE EXTENSION IF NOT EXISTS vector;`)
    await this.sql(REGISTRY_SQL(this.registryTable))
    await this.sql(HASH_TABLE_SQL(this.hashesTable))
    await this.hashStore.initialize()

    // Load existing model registrations
    const rows = await this.sql(`SELECT model_key, table_name FROM ${this.registryTable}`)
    for (const row of rows) {
      this.modelTables.set(row.model_key, row.table_name)
    }
  }

  async ensureModel(model: string, dimensions: number): Promise<void> {
    const key = sanitizeModelKey(model)
    if (this.modelTables.has(key)) return

    const tableName = `${this.tablePrefix}_${key}`
    await this.sql(MODEL_TABLE_SQL(tableName, dimensions))
    await this.sql(
      `INSERT INTO ${this.registryTable} (model_key, model_id, table_name, dimensions)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (model_key) DO NOTHING`,
      [key, model, tableName, dimensions]
    )
    this.modelTables.set(key, tableName)
  }

  private getTable(model: string): string {
    const key = sanitizeModelKey(model)
    const table = this.modelTables.get(key)
    if (!table) throw new Error(`No table registered for model "${model}". Call ensureModel() first.`)
    return table
  }

  async upsertDocument(model: string, chunks: EmbeddedChunk[]): Promise<void> {
    if (chunks.length === 0) return
    const _table = this.getTable(model)
    // TODO: single unnest INSERT with ON CONFLICT DO UPDATE
    throw new Error('Not implemented')
  }

  async delete(model: string, filter: ChunkFilter): Promise<void> {
    const _table = this.getTable(model)
    // TODO: build WHERE clause from filter fields, execute DELETE
    throw new Error('Not implemented')
  }

  async search(model: string, embedding: number[], opts: SearchOpts): Promise<ScoredChunk[]> {
    const _table = this.getTable(model)
    // TODO: SET LOCAL hnsw.iterative_scan = relaxed_order + cosine ORDER BY LIMIT
    throw new Error('Not implemented')
  }

  async hybridSearch(
    model: string,
    embedding: number[],
    query: string,
    opts: SearchOpts
  ): Promise<ScoredChunk[]> {
    const _table = this.getTable(model)
    // TODO: full RRF query — tsq CTE + iterative HNSW + keyword_ranked
    throw new Error('Not implemented')
  }

  async countChunks(model: string, filter: ChunkFilter): Promise<number> {
    const _table = this.getTable(model)
    // TODO: SELECT COUNT(*) WHERE sourceId + tenantId + idempotencyKey
    throw new Error('Not implemented')
  }

  async destroy(): Promise<void> {
    // TODO: close connection pool
  }
}
