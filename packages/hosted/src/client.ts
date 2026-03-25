import type { d8umInstance, d8umConfig, SourcesApi, JobsApi, DocumentJobsApi } from '@d8um/core'
import type { Source, CreateSourceInput, IndexConfig } from '@d8um/core'
import type { Job, CreateJobInput, JobRunResult } from '@d8um/core'
import type { DocumentJobRelation, DocumentJobRelationType } from '@d8um/core'
import type { QueryOpts, QueryResponse, AssembleOpts, d8umResult } from '@d8um/core'
import type { IndexOpts, IndexResult } from '@d8um/core'
import type { EmbeddingProvider } from '@d8um/core'
import type { RawDocument, Chunk, Connector } from '@d8um/core'
import type { d8umDocument, DocumentFilter } from '@d8um/core'
import type { ContextSearchOpts, ContextSearchResponse } from '@d8um/core'
import { assemble as assembleResults } from '@d8um/core'
import type { HostedConfig } from './types.js'
import { HttpClient } from './http-client.js'

/**
 * Extended d8um instance for hosted mode.
 * Includes full CRUD for sources, jobs, and documents.
 */
export interface d8umHostedInstance extends d8umInstance {
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

  const sources: SourcesApi = {
    create(input: CreateSourceInput): Source {
      // Fire-and-forget async registration
      void client.post('/v1/sources', input)
      return {
        id: 'pending',
        name: input.name,
        description: input.description,
        status: 'active',
        tenantId: input.tenantId,
      }
    },
    get(_sourceId: string): Source | undefined {
      throw new Error('Use async listSources() in hosted mode')
    },
    list(): Source[] {
      throw new Error('Use async listSources() in hosted mode')
    },
    update(sourceId: string, input): Source {
      void client.patch(`/v1/sources/${encodeURIComponent(sourceId)}`, input)
      return { id: sourceId, name: '', status: 'active', ...input }
    },
    delete(sourceId: string): void {
      void client.delete(`/v1/sources/${encodeURIComponent(sourceId)}`)
    },
  }

  const jobs: JobsApi = {
    create(input: CreateJobInput): Job {
      void client.post('/v1/jobs', input)
      const now = new Date()
      return {
        id: 'pending',
        type: input.type,
        name: input.name,
        description: input.description,
        sourceId: input.sourceId,
        tenantId: input.tenantId,
        config: input.config ?? {},
        schedule: input.schedule,
        status: 'idle',
        runCount: 0,
        createdAt: now,
        updatedAt: now,
      }
    },
    get(_jobId: string): Job | undefined {
      throw new Error('Use async API in hosted mode')
    },
    list(): Job[] {
      throw new Error('Use async API in hosted mode')
    },
    update(jobId: string, input): Job {
      void client.patch(`/v1/jobs/${encodeURIComponent(jobId)}`, input)
      const now = new Date()
      return { id: jobId, type: '', name: '', config: {}, status: 'idle', runCount: 0, createdAt: now, updatedAt: now, ...input }
    },
    delete(jobId: string, opts?): void {
      void client.delete(`/v1/jobs/${encodeURIComponent(jobId)}`, opts)
    },
    async run(jobId: string): Promise<JobRunResult> {
      return client.post<JobRunResult>(`/v1/jobs/${encodeURIComponent(jobId)}/run`)
    },
    pause(jobId: string): void {
      void client.post(`/v1/jobs/${encodeURIComponent(jobId)}/pause`)
    },
    resume(jobId: string): void {
      void client.post(`/v1/jobs/${encodeURIComponent(jobId)}/resume`)
    },
  }

  const documentJobs: DocumentJobsApi = {
    getJobsForDocument(_documentId: string): DocumentJobRelation[] {
      throw new Error('Use async API in hosted mode')
    },
    getDocumentsForJob(_jobId: string): DocumentJobRelation[] {
      throw new Error('Use async API in hosted mode')
    },
    addRelation(_documentId: string, _jobId: string, _relation: DocumentJobRelationType): void {
      throw new Error('Use async API in hosted mode')
    },
  }

  return {
    // --- d8umInstance methods ---

    initialize(_config: d8umConfig): d8umHostedInstance {
      return this as d8umHostedInstance
    },

    sources,
    jobs,
    documentJobs,

    getEmbeddingForSource(_sourceId: string): EmbeddingProvider {
      throw new Error('getEmbeddingForSource() is not available in hosted mode — embedding is managed server-side')
    },

    getDistinctEmbeddings(): Map<string, EmbeddingProvider> {
      throw new Error('getDistinctEmbeddings() is not available in hosted mode — embedding is managed server-side')
    },

    groupSourcesByModel(): Map<string, string[]> {
      throw new Error('groupSourcesByModel() is not available in hosted mode — embedding is managed server-side')
    },

    async indexWithConnector(
      sourceId: string,
      _connector: Connector,
      _indexConfig: IndexConfig,
      opts?: IndexOpts,
    ): Promise<IndexResult> {
      return client.post<IndexResult>(`/v1/sources/${encodeURIComponent(sourceId)}/index`, opts)
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
      _indexConfig: IndexConfig,
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
      return assembleResults(results, opts)
    },

    async destroy(): Promise<void> {
      // No-op in hosted mode
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
