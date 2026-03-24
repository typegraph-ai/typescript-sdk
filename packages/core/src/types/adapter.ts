import type { EmbeddedChunk, ChunkFilter, ScoredChunk } from './document.js'

export interface SearchOpts {
  topK: number
  filter?: ChunkFilter | undefined
  approximate?: boolean | undefined
  iterativeScan?: boolean | undefined
}

export interface HashRecord {
  idempotencyKey: string
  contentHash: string
  sourceId: string
  tenantId?: string | undefined
  embeddingModel: string
  indexedAt: Date
  chunkCount: number
}

export interface HashStoreAdapter {
  initialize(): Promise<void>
  get(key: string): Promise<HashRecord | null>
  set(key: string, record: HashRecord): Promise<void>
  delete(key: string): Promise<void>
  listBySource(sourceId: string, tenantId?: string | undefined): Promise<HashRecord[]>
  getLastRunTime(sourceId: string, tenantId?: string | undefined): Promise<Date | null>
  setLastRunTime(sourceId: string, tenantId: string | undefined, time: Date): Promise<void>
  deleteBySource(sourceId: string, tenantId?: string | undefined): Promise<void>
}

export interface VectorStoreAdapter {
  initialize(): Promise<void>
  destroy?(): Promise<void>

  /** Ensure a model's storage (e.g., table) exists. Called lazily before first write. */
  ensureModel(model: string, dimensions: number): Promise<void>

  upsertDocument(model: string, chunks: EmbeddedChunk[]): Promise<void>
  delete(model: string, filter: ChunkFilter): Promise<void>

  search(model: string, embedding: number[], opts: SearchOpts): Promise<ScoredChunk[]>
  hybridSearch?(model: string, embedding: number[], query: string, opts: SearchOpts): Promise<ScoredChunk[]>
  countChunks(model: string, filter: ChunkFilter): Promise<number>

  hashStore: HashStoreAdapter
}
