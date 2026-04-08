import type { d8umInstance, d8umConfig, BucketsApi, DocumentsApi, JobsApi, GraphApi } from '../d8um.js'
import type { Bucket, CreateBucketInput, BucketListFilter } from '../types/bucket.js'
import type { QueryOpts, QueryResponse } from '../types/query.js'
import type { IndexOpts, IndexResult } from '../types/index-types.js'
import type { EmbeddingProvider } from '../embedding/provider.js'
import type { RawDocument, Chunk } from '../types/connector.js'
import type { d8umDocument, DocumentFilter } from '../types/d8um-document.js'
import type { d8umIdentity } from '../types/identity.js'
import type { CreatePolicyInput, UpdatePolicyInput, Policy, PolicyType } from '../types/policy.js'
import type { UndeployResult } from '../types/adapter.js'
import type { PaginationOpts, PaginatedResult } from '../types/pagination.js'
import type { IndexConfig } from '../types/bucket.js'
import type { MemoryRecord, ConversationTurnResult, MemoryHealthReport } from '../types/memory.js'
import type { Job, JobFilter } from '../types/job.js'
import type { EntityResult, EntityDetail, EdgeResult, SubgraphOpts, SubgraphResult, GraphStats } from '../types/graph-bridge.js'
import { DEFAULT_BUCKET_ID } from '../d8um.js'
import { HttpClient } from './http-client.js'
import type { CloudConfig } from './http-client.js'

/**
 * Extended d8um instance for cloud mode.
 * Includes document CRUD methods available via the hosted API.
 */
export interface d8umCloudInstance extends d8umInstance {
  listDocuments(filter?: DocumentFilter): Promise<d8umDocument[]>
  getDocument(documentId: string): Promise<d8umDocument>
  updateDocument(documentId: string, update: Partial<d8umDocument>): Promise<d8umDocument>
  deleteDocuments(filter: DocumentFilter): Promise<number>
}

/**
 * Create a d8um instance backed by the hosted cloud service.
 * Everything runs server-side — embedding, indexing, storage, memory.
 */
export function createCloudInstance(config: CloudConfig): d8umCloudInstance {
  const client = new HttpClient(config)
  const e = encodeURIComponent

  const buckets: BucketsApi = {
    async create(input: CreateBucketInput): Promise<Bucket> {
      return client.post<Bucket>('/v1/buckets', input)
    },
    async get(bucketId: string): Promise<Bucket | undefined> {
      return client.get<Bucket>(`/v1/buckets/${e(bucketId)}`)
    },
    async list(filter?: BucketListFilter, pagination?: PaginationOpts): Promise<Bucket[] | PaginatedResult<Bucket>> {
      const searchParams = new URLSearchParams()
      if (filter?.tenantId) searchParams.set('tenantId', filter.tenantId)
      if (filter?.groupId) searchParams.set('groupId', filter.groupId)
      if (filter?.userId) searchParams.set('userId', filter.userId)
      if (filter?.agentId) searchParams.set('agentId', filter.agentId)
      if (filter?.conversationId) searchParams.set('conversationId', filter.conversationId)
      if (pagination?.limit != null) searchParams.set('limit', String(pagination.limit))
      if (pagination?.offset != null) searchParams.set('offset', String(pagination.offset))
      const qs = searchParams.toString()
      if (pagination) {
        return client.get<PaginatedResult<Bucket>>(`/v1/buckets${qs ? `?${qs}` : ''}`)
      }
      return client.get<Bucket[]>(`/v1/buckets${qs ? `?${qs}` : ''}`)
    },
    async update(bucketId: string, input): Promise<Bucket> {
      return client.patch<Bucket>(`/v1/buckets/${e(bucketId)}`, input)
    },
    async delete(bucketId: string): Promise<void> {
      await client.delete(`/v1/buckets/${e(bucketId)}`)
    },
  }

  const documents: DocumentsApi = {
    async get(id: string): Promise<d8umDocument | null> {
      return client.get<d8umDocument | null>(`/v1/documents/${e(id)}`)
    },
    async list(filter?: DocumentFilter, pagination?: PaginationOpts): Promise<d8umDocument[] | PaginatedResult<d8umDocument>> {
      if (pagination) {
        return client.post<PaginatedResult<d8umDocument>>('/v1/documents/list', { ...filter, ...pagination })
      }
      return client.post<d8umDocument[]>('/v1/documents/list', filter)
    },
    async update(id: string, input): Promise<d8umDocument> {
      return client.patch<d8umDocument>(`/v1/documents/${e(id)}`, input)
    },
    async delete(filter: DocumentFilter): Promise<number> {
      return client.delete<number>('/v1/documents', filter)
    },
  }

  const jobs: JobsApi = {
    async get(id: string): Promise<Job | null> {
      return client.get<Job | null>(`/v1/jobs/${e(id)}`)
    },
    async list(filter?: JobFilter): Promise<Job[]> {
      return client.post<Job[]>('/v1/jobs/list', filter)
    },
  }

  const graph: GraphApi = {
    async searchEntities(query: string, identity: d8umIdentity, opts?: {
      limit?: number
      entityType?: string
      minConnections?: number
    }): Promise<EntityResult[]> {
      return client.post<EntityResult[]>('/v1/graph/entities/search', { query, identity, ...opts })
    },
    async getEntity(id: string): Promise<EntityDetail | null> {
      return client.get<EntityDetail | null>(`/v1/graph/entities/${e(id)}`)
    },
    async getEdges(entityId: string, opts?: {
      direction?: 'in' | 'out' | 'both'
      relation?: string
      limit?: number
    }): Promise<EdgeResult[]> {
      return client.post<EdgeResult[]>(`/v1/graph/entities/${e(entityId)}/edges`, opts)
    },
    async getSubgraph(opts: SubgraphOpts): Promise<SubgraphResult> {
      return client.post<SubgraphResult>('/v1/graph/subgraph', opts)
    },
    async stats(identity: d8umIdentity): Promise<GraphStats> {
      return client.post<GraphStats>('/v1/graph/stats', { identity })
    },
    async getRelationTypes(identity: d8umIdentity): Promise<Array<{ relation: string; count: number }>> {
      return client.post('/v1/graph/relation-types', { identity })
    },
    async getEntityTypes(identity: d8umIdentity): Promise<Array<{ entityType: string; count: number }>> {
      return client.post('/v1/graph/entity-types', { identity })
    },
  }

  const instance: d8umCloudInstance = {
    async deploy(_config: d8umConfig): Promise<d8umCloudInstance> {
      return instance
    },

    async initialize(_config: d8umConfig): Promise<d8umCloudInstance> {
      return instance
    },

    async undeploy(): Promise<UndeployResult> {
      return { success: false, message: 'undeploy() is not available in cloud mode — infrastructure is managed server-side.' }
    },

    buckets,
    documents,
    jobs,
    graph,

    policies: {
      async create(input: CreatePolicyInput): Promise<Policy> {
        return client.post<Policy>('/v1/policies', input)
      },
      async get(id: string): Promise<Policy | null> {
        return client.get<Policy | null>(`/v1/policies/${e(id)}`)
      },
      async list(filter?: { tenantId?: string; policyType?: PolicyType; enabled?: boolean }): Promise<Policy[]> {
        return client.post<Policy[]>('/v1/policies/list', filter)
      },
      async update(id: string, input: UpdatePolicyInput): Promise<Policy> {
        return client.patch<Policy>(`/v1/policies/${e(id)}`, input)
      },
      async delete(id: string): Promise<void> {
        await client.delete(`/v1/policies/${e(id)}`)
      },
    },

    getEmbeddingForBucket(_bucketId: string): EmbeddingProvider {
      throw new Error('getEmbeddingForBucket() is not available in cloud mode — embedding is managed server-side.')
    },

    getDistinctEmbeddings(): Map<string, EmbeddingProvider> {
      throw new Error('getDistinctEmbeddings() is not available in cloud mode — embedding is managed server-side.')
    },

    groupBucketsByModel(): Map<string, string[]> {
      throw new Error('groupBucketsByModel() is not available in cloud mode — embedding is managed server-side.')
    },

    async query(text: string, opts?: QueryOpts): Promise<QueryResponse> {
      return client.post<QueryResponse>('/v1/query', { text, ...opts })
    },

    async ingest(docs: RawDocument[], indexConfig: IndexConfig, opts?: IndexOpts): Promise<IndexResult> {
      const bucketId = opts?.bucketId || DEFAULT_BUCKET_ID
      return client.post<IndexResult>(`/v1/buckets/${e(bucketId)}/ingest`, { docs, indexConfig, ...opts })
    },

    async ingestPreChunked(doc: RawDocument, chunks: Chunk[], opts?: IndexOpts): Promise<IndexResult> {
      const bucketId = opts?.bucketId || DEFAULT_BUCKET_ID
      return client.post<IndexResult>(`/v1/buckets/${e(bucketId)}/ingest`, { doc, chunks, ...opts })
    },

    async remember(content: string, identity: d8umIdentity, category?: string, opts?: {
      importance?: number
      metadata?: Record<string, unknown>
    }): Promise<MemoryRecord> {
      return client.post<MemoryRecord>('/v1/memory/remember', { content, identity, category, ...opts })
    },

    async forget(id: string, identity: d8umIdentity): Promise<void> {
      await client.post('/v1/memory/forget', { id, identity })
    },

    async correct(correction: string, identity: d8umIdentity): Promise<{ invalidated: number; created: number; summary: string }> {
      return client.post('/v1/memory/correct', { correction, identity })
    },

    async recall(query: string, identity: d8umIdentity, opts?: { limit?: number; types?: string[] }): Promise<MemoryRecord[]> {
      return client.post<MemoryRecord[]>('/v1/memory/recall', { query, identity, ...opts })
    },

    async buildMemoryContext(query: string, identity: d8umIdentity, opts?: {
      includeWorking?: boolean
      includeFacts?: boolean
      includeEpisodes?: boolean
      includeProcedures?: boolean
      maxMemoryTokens?: number
      format?: 'xml' | 'markdown' | 'plain'
    }): Promise<string> {
      return client.post<string>('/v1/memory/context', { query, identity, ...opts })
    },

    async healthCheck(identity: d8umIdentity): Promise<MemoryHealthReport> {
      return client.post<MemoryHealthReport>('/v1/memory/health', { identity })
    },

    async addConversationTurn(
      messages: Array<{ role: string; content: string; timestamp?: Date }>,
      identity: d8umIdentity,
      conversationId?: string,
    ): Promise<ConversationTurnResult> {
      return client.post<ConversationTurnResult>('/v1/memory/conversation', { messages, identity, conversationId })
    },

    async destroy(): Promise<void> {
      // No-op in cloud mode
    },

    // ── Document CRUD (cloud-only extensions) ──

    async listDocuments(filter?: DocumentFilter): Promise<d8umDocument[]> {
      return client.post<d8umDocument[]>('/v1/documents/list', filter)
    },

    async getDocument(documentId: string): Promise<d8umDocument> {
      return client.get<d8umDocument>(`/v1/documents/${e(documentId)}`)
    },

    async updateDocument(documentId: string, update: Partial<d8umDocument>): Promise<d8umDocument> {
      return client.patch<d8umDocument>(`/v1/documents/${e(documentId)}`, update)
    },

    async deleteDocuments(filter: DocumentFilter): Promise<number> {
      return client.delete<number>('/v1/documents', filter)
    },
  }

  return instance
}
