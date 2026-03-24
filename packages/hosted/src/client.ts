import type { d8umInstance, d8umConfig } from '@d8um/core'
import type { d8umSource } from '@d8um/core'
import type { QueryOpts, QueryResponse, AssembleOpts, d8umResult } from '@d8um/core'
import type { IndexOpts, IndexResult } from '@d8um/core'
import type { EmbeddingProvider } from '@d8um/core'
import type { RawDocument, Chunk } from '@d8um/core'
import type { d8umDocument, DocumentFilter } from '@d8um/core'
import type { ContextSearchOpts, ContextSearchResponse } from '@d8um/core'
import { assemble as assembleResults } from '@d8um/core'
import type { HostedConfig } from './types.js'
import { HttpClient } from './http-client.js'

/**
 * Extended d8um instance for hosted mode.
 * Includes full CRUD for sources and documents in addition to
 * the standard d8umInstance methods.
 */
export interface d8umHostedInstance extends d8umInstance {
  // Source CRUD
  listSources(): Promise<d8umSource[]>
  getSource(sourceId: string): Promise<d8umSource>
  updateSource(sourceId: string, update: Partial<d8umSource>): Promise<d8umSource>
  deleteSource(sourceId: string): Promise<void>

  // Document CRUD
  listDocuments(filter?: DocumentFilter): Promise<d8umDocument[]>
  getDocument(documentId: string): Promise<d8umDocument>
  updateDocument(documentId: string, update: Partial<d8umDocument>): Promise<d8umDocument>
  deleteDocuments(filter: DocumentFilter): Promise<number>
}

/**
 * Create a d8um instance backed by the hosted SaaS service.
 * Everything runs server-side — embedding, indexing, storage, connectors.
 * Just pass an API key.
 */
export function d8umHosted(config: HostedConfig): d8umHostedInstance {
  const client = new HttpClient(config)

  return {
    // --- d8umInstance methods ---

    initialize(_config: d8umConfig): d8umHostedInstance {
      // No-op in hosted mode — config is managed server-side
      return this as d8umHostedInstance
    },

    addSource(source: d8umSource): d8umHostedInstance {
      // Fire-and-forget async registration — the source is created server-side.
      // Connector instances are not serialized; the server configures connectors
      // based on the source id, mode, and index config.
      void client.post('/v1/sources', {
        id: source.id,
        mode: source.mode,
        index: source.index,
        cache: source.cache,
      })
      return this as d8umHostedInstance
    },

    getEmbeddingForSource(_sourceId: string): EmbeddingProvider {
      throw new Error('getEmbeddingForSource() is not available in hosted mode — embedding is managed server-side')
    },

    getDistinctEmbeddings(): Map<string, EmbeddingProvider> {
      throw new Error('getDistinctEmbeddings() is not available in hosted mode — embedding is managed server-side')
    },

    groupSourcesByModel(): Map<string, string[]> {
      throw new Error('groupSourcesByModel() is not available in hosted mode — embedding is managed server-side')
    },

    async index(sourceId?: string, opts?: IndexOpts): Promise<IndexResult | IndexResult[]> {
      if (sourceId) {
        return client.post<IndexResult>(`/v1/sources/${encodeURIComponent(sourceId)}/index`, opts)
      }
      return client.post<IndexResult[]>('/v1/index', opts)
    },

    async query(text: string, opts?: QueryOpts): Promise<QueryResponse> {
      return client.post<QueryResponse>('/v1/query', { text, ...opts })
    },

    async searchWithContext(text: string, opts?: ContextSearchOpts): Promise<ContextSearchResponse> {
      return client.post<ContextSearchResponse>('/v1/search-with-context', { text, ...opts })
    },

    async ingest(
      sourceId: string,
      doc: RawDocument,
      opts?: IndexOpts
    ): Promise<IndexResult> {
      return client.post<IndexResult>(
        `/v1/sources/${encodeURIComponent(sourceId)}/ingest`,
        { doc, ...opts }
      )
    },

    async ingestWithChunks(
      sourceId: string,
      doc: RawDocument,
      chunks: Chunk[],
      opts?: IndexOpts
    ): Promise<IndexResult> {
      return client.post<IndexResult>(
        `/v1/sources/${encodeURIComponent(sourceId)}/ingest`,
        { doc, chunks, ...opts }
      )
    },

    assemble(results: d8umResult[], opts?: AssembleOpts): string {
      // Runs locally — pure string formatting, no network call needed
      return assembleResults(results, opts)
    },

    async destroy(): Promise<void> {
      // No-op in hosted mode
    },

    // --- Source CRUD ---

    async listSources(): Promise<d8umSource[]> {
      return client.get<d8umSource[]>('/v1/sources')
    },

    async getSource(sourceId: string): Promise<d8umSource> {
      return client.get<d8umSource>(`/v1/sources/${encodeURIComponent(sourceId)}`)
    },

    async updateSource(sourceId: string, update: Partial<d8umSource>): Promise<d8umSource> {
      return client.patch<d8umSource>(`/v1/sources/${encodeURIComponent(sourceId)}`, update)
    },

    async deleteSource(sourceId: string): Promise<void> {
      await client.delete(`/v1/sources/${encodeURIComponent(sourceId)}`)
    },

    // --- Document CRUD ---

    async listDocuments(filter?: DocumentFilter): Promise<d8umDocument[]> {
      return client.post<d8umDocument[]>('/v1/documents/list', filter)
    },

    async getDocument(documentId: string): Promise<d8umDocument> {
      return client.get<d8umDocument>(`/v1/documents/${encodeURIComponent(documentId)}`)
    },

    async updateDocument(documentId: string, update: Partial<d8umDocument>): Promise<d8umDocument> {
      return client.patch<d8umDocument>(`/v1/documents/${encodeURIComponent(documentId)}`, update)
    },

    async deleteDocuments(filter: DocumentFilter): Promise<number> {
      return client.delete<number>('/v1/documents', filter)
    },
  }
}
