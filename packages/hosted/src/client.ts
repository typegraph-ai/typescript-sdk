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
 * Everything runs server-side - embedding, indexing, storage, connectors.
 * Just pass an API key.
 */
export function d8umHosted(config: HostedConfig): d8umHostedInstance {
  const client = new HttpClient(config)

  const sources: SourcesApi = {
    async create(input: CreateSourceInput): Promise<Source> {
      return client.post<Source>('/v1/sources', input)
    },
    async get(sourceId: string): Promise<Source | undefined> {
      return client.get<Source>(`/v1/sources/${encodeURIComponent(sourceId)}`)
    },
    async list(tenantId?: string): Promise<Source[]> {
      const params = tenantId ? `?tenantId=${encodeURIComponent(tenantId)}` : ''
      return client.get<Source[]>(`/v1/sources${params}`)
    },
    async update(sourceId: string, input): Promise<Source> {
      return client.patch<Source>(`/v1/sources/${encodeURIComponent(sourceId)}`, input)
    },
    async delete(sourceId: string): Promise<void> {
      await client.delete(`/v1/sources/${encodeURIComponent(sourceId)}`)
    },
  }

  const jobs: JobsApi = {
    async create(input: CreateJobInput): Promise<Job> {
      return client.post<Job>('/v1/jobs', input)
    },
    async get(jobId: string): Promise<Job | undefined> {
      return client.get<Job>(`/v1/jobs/${encodeURIComponent(jobId)}`)
    },
    async list(filter?): Promise<Job[]> {
      const params = new URLSearchParams()
      if (filter?.sourceId) params.set('sourceId', filter.sourceId)
      if (filter?.type) params.set('type', filter.type)
      if (filter?.tenantId) params.set('tenantId', filter.tenantId)
      const qs = params.toString()
      return client.get<Job[]>(`/v1/jobs${qs ? `?${qs}` : ''}`)
    },
    async update(jobId: string, input): Promise<Job> {
      return client.patch<Job>(`/v1/jobs/${encodeURIComponent(jobId)}`, input)
    },
    async delete(jobId: string, opts?): Promise<void> {
      await client.delete(`/v1/jobs/${encodeURIComponent(jobId)}`, opts)
    },
    async run(jobId: string): Promise<JobRunResult> {
      return client.post<JobRunResult>(`/v1/jobs/${encodeURIComponent(jobId)}/run`)
    },
    async pause(jobId: string): Promise<void> {
      await client.post(`/v1/jobs/${encodeURIComponent(jobId)}/pause`)
    },
    async resume(jobId: string): Promise<void> {
      await client.post(`/v1/jobs/${encodeURIComponent(jobId)}/resume`)
    },
  }

  const documentJobs: DocumentJobsApi = {
    async getJobsForDocument(documentId: string): Promise<DocumentJobRelation[]> {
      return client.get<DocumentJobRelation[]>(`/v1/document-jobs?documentId=${encodeURIComponent(documentId)}`)
    },
    async getDocumentsForJob(jobId: string): Promise<DocumentJobRelation[]> {
      return client.get<DocumentJobRelation[]>(`/v1/document-jobs?jobId=${encodeURIComponent(jobId)}`)
    },
    async addRelation(documentId: string, jobId: string, relation: DocumentJobRelationType): Promise<void> {
      await client.post('/v1/document-jobs', { documentId, jobId, relation })
    },
  }

  return {
    // --- d8umInstance methods ---

    async initialize(_config: d8umConfig): Promise<d8umHostedInstance> {
      return this as d8umHostedInstance
    },

    sources,
    jobs,
    documentJobs,

    getEmbeddingForSource(_sourceId: string): EmbeddingProvider {
      throw new Error('getEmbeddingForSource() is not available in hosted mode - embedding is managed server-side')
    },

    getDistinctEmbeddings(): Map<string, EmbeddingProvider> {
      throw new Error('getDistinctEmbeddings() is not available in hosted mode - embedding is managed server-side')
    },

    groupSourcesByModel(): Map<string, string[]> {
      throw new Error('groupSourcesByModel() is not available in hosted mode - embedding is managed server-side')
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
