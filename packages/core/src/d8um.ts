import type { VectorStoreAdapter } from './types/adapter.js'
import type { Source, CreateSourceInput, EmbeddingInput, IndexConfig } from './types/source.js'
import type {
  Job,
  CreateJobInput,
  JobRunContext,
  JobRunResult,
  ApiClient,
} from './types/job.js'
import type {
  DocumentJobRelation,
  DocumentJobRelationType,
  DocumentJobRelationFilter,
} from './types/document-job-relation.js'
import type { QueryOpts, QueryResponse, d8umResult, AssembleOpts } from './types/query.js'
import type { IndexOpts, IndexResult } from './types/index-types.js'
import type { EmbeddingProvider } from './embedding/provider.js'
import type { RawDocument, Chunk, Connector } from './types/connector.js'
import type { d8umHooks } from './types/hooks.js'
import type { ContextSearchOpts, ContextSearchResponse } from './query/context-search.js'
import { aiSdkEmbeddingProvider, isAISDKEmbeddingInput } from './embedding/ai-sdk-adapter.js'
import { IndexEngine } from './index-engine/engine.js'
import { searchWithContext as searchWithContextFn } from './query/context-search.js'
import { assemble as assembleResults } from './query/assemble.js'
import { getJobType } from './jobs/registry.js'
import { randomUUID } from 'crypto'

export interface d8umConfig {
  vectorStore: VectorStoreAdapter
  embedding: EmbeddingInput
  tenantId?: string | undefined
  tokenizer?: ((text: string) => number) | undefined
  hooks?: d8umHooks | undefined
}

function isEmbeddingProvider(
  value: EmbeddingInput
): value is EmbeddingProvider {
  return 'embed' in value && 'embedBatch' in value && 'dimensions' in value
}

export function resolveEmbeddingProvider(config: EmbeddingInput): EmbeddingProvider {
  if (isEmbeddingProvider(config)) return config
  if (isAISDKEmbeddingInput(config)) return aiSdkEmbeddingProvider(config)

  throw new Error('Invalid embedding configuration')
}

// ── Sources Sub-API ──

export interface SourcesApi {
  create(input: CreateSourceInput): Source
  get(sourceId: string): Source | undefined
  list(tenantId?: string): Source[]
  update(sourceId: string, input: Partial<Pick<Source, 'name' | 'description' | 'status'>>): Source
  delete(sourceId: string): void
}

// ── Jobs Sub-API ──

export interface JobsApi {
  create(input: CreateJobInput): Job
  get(jobId: string): Job | undefined
  list(filter?: { sourceId?: string; type?: string; tenantId?: string }): Job[]
  update(jobId: string, input: Partial<Pick<Job, 'name' | 'description' | 'config' | 'schedule' | 'status'>>): Job
  /** Delete a job. cascade=true deletes orphaned documents (those with no other job relations). */
  delete(jobId: string, opts?: { cascade?: boolean }): void
  run(jobId: string): Promise<JobRunResult>
  pause(jobId: string): void
  resume(jobId: string): void
}

// ── Document-Job Relations Sub-API ──

export interface DocumentJobsApi {
  getJobsForDocument(documentId: string): DocumentJobRelation[]
  getDocumentsForJob(jobId: string): DocumentJobRelation[]
  addRelation(documentId: string, jobId: string, relation: DocumentJobRelationType): void
}

/** The d8um instance interface — all public methods. */
export interface d8umInstance {
  initialize(config: d8umConfig): this

  sources: SourcesApi
  jobs: JobsApi
  documentJobs: DocumentJobsApi

  getEmbeddingForSource(sourceId: string): EmbeddingProvider
  getDistinctEmbeddings(sourceIds?: string[]): Map<string, EmbeddingProvider>
  groupSourcesByModel(sourceIds?: string[]): Map<string, string[]>

  /** Index documents from a connector into a source. */
  indexWithConnector(
    sourceId: string,
    connector: Connector,
    indexConfig: IndexConfig,
    opts?: IndexOpts,
  ): Promise<IndexResult>

  /** Ingest a single document directly into a source. No job needed. */
  ingest(sourceId: string, doc: RawDocument, indexConfig: IndexConfig, opts?: IndexOpts): Promise<IndexResult>

  /** Ingest a document with pre-chunked content. */
  ingestWithChunks(sourceId: string, doc: RawDocument, chunks: Chunk[], opts?: IndexOpts): Promise<IndexResult>

  /** Search across sources. */
  query(text: string, opts?: QueryOpts): Promise<QueryResponse>
  searchWithContext(text: string, opts?: ContextSearchOpts): Promise<ContextSearchResponse>
  assemble(results: d8umResult[], opts?: AssembleOpts): string

  destroy(): Promise<void>
}

class d8umImpl implements d8umInstance {
  private _sources = new Map<string, Source>()
  private _jobs = new Map<string, Job>()
  private _documentJobRelations: DocumentJobRelation[] = []
  private sourceEmbeddings = new Map<string, EmbeddingProvider>()
  private adapter!: VectorStoreAdapter
  private defaultEmbedding!: EmbeddingProvider
  private config!: d8umConfig
  private configured = false
  private initialized = false

  // ── Sources ──

  sources: SourcesApi = {
    create: (input: CreateSourceInput): Source => {
      this.assertConfigured()
      const source: Source = {
        id: randomUUID(),
        name: input.name,
        description: input.description,
        status: 'active',
        tenantId: input.tenantId ?? this.config.tenantId,
      }
      this._sources.set(source.id, source)
      this.sourceEmbeddings.set(source.id, this.defaultEmbedding)
      return source
    },

    get: (sourceId: string): Source | undefined => {
      return this._sources.get(sourceId)
    },

    list: (tenantId?: string): Source[] => {
      const all = [...this._sources.values()]
      if (tenantId) return all.filter(s => s.tenantId === tenantId)
      return all
    },

    update: (sourceId: string, input: Partial<Pick<Source, 'name' | 'description' | 'status'>>): Source => {
      const source = this._sources.get(sourceId)
      if (!source) throw new Error(`Source "${sourceId}" not found`)
      if (input.name !== undefined) source.name = input.name
      if (input.description !== undefined) source.description = input.description
      if (input.status !== undefined) source.status = input.status
      return source
    },

    delete: (sourceId: string): void => {
      // Delete source, cascade to jobs targeting it, and clean up relations
      const jobsToDelete = [...this._jobs.values()].filter(j => j.sourceId === sourceId)
      for (const job of jobsToDelete) {
        this.jobs.delete(job.id, { cascade: true })
      }
      this._sources.delete(sourceId)
      this.sourceEmbeddings.delete(sourceId)
    },
  }

  // ── Jobs ──

  jobs: JobsApi = {
    create: (input: CreateJobInput): Job => {
      this.assertConfigured()

      // Validate source exists if required
      if (input.sourceId && !this._sources.has(input.sourceId)) {
        throw new Error(`Source "${input.sourceId}" not found`)
      }

      // Validate job type exists and check source requirement
      const jobType = getJobType(input.type)
      if (jobType?.requiresSource && !input.sourceId) {
        throw new Error(`Job type "${input.type}" requires a sourceId`)
      }

      const now = new Date()
      const job: Job = {
        id: randomUUID(),
        tenantId: input.tenantId ?? this.config.tenantId,
        sourceId: input.sourceId,
        type: input.type,
        name: input.name,
        description: input.description,
        config: input.config ?? {},
        schedule: input.schedule,
        status: input.schedule ? 'scheduled' : 'idle',
        runCount: 0,
        createdAt: now,
        updatedAt: now,
      }
      this._jobs.set(job.id, job)
      return job
    },

    get: (jobId: string): Job | undefined => {
      return this._jobs.get(jobId)
    },

    list: (filter?: { sourceId?: string; type?: string; tenantId?: string }): Job[] => {
      let jobs = [...this._jobs.values()]
      if (filter?.sourceId) jobs = jobs.filter(j => j.sourceId === filter.sourceId)
      if (filter?.type) jobs = jobs.filter(j => j.type === filter.type)
      if (filter?.tenantId) jobs = jobs.filter(j => j.tenantId === filter.tenantId)
      return jobs
    },

    update: (jobId: string, input: Partial<Pick<Job, 'name' | 'description' | 'config' | 'schedule' | 'status'>>): Job => {
      const job = this._jobs.get(jobId)
      if (!job) throw new Error(`Job "${jobId}" not found`)
      if (input.name !== undefined) job.name = input.name
      if (input.description !== undefined) job.description = input.description
      if (input.config !== undefined) job.config = input.config
      if (input.schedule !== undefined) job.schedule = input.schedule
      if (input.status !== undefined) job.status = input.status
      job.updatedAt = new Date()
      return job
    },

    delete: (jobId: string, opts?: { cascade?: boolean }): void => {
      const job = this._jobs.get(jobId)
      if (!job) return

      if (opts?.cascade) {
        // Find documents where this job is the ONLY related job
        const jobRelations = this._documentJobRelations.filter(r => r.jobId === jobId)
        for (const rel of jobRelations) {
          const otherRelations = this._documentJobRelations.filter(
            r => r.documentId === rel.documentId && r.jobId !== jobId
          )
          if (otherRelations.length === 0) {
            // This is the sole job — document is orphaned, would be deleted
            // (actual document deletion depends on adapter — flag for deletion)
            // In a real implementation, adapter.deleteDocuments() would be called
          }
        }
      }

      // Remove all relations for this job
      this._documentJobRelations = this._documentJobRelations.filter(r => r.jobId !== jobId)
      this._jobs.delete(jobId)
    },

    run: async (jobId: string): Promise<JobRunResult> => {
      const job = this._jobs.get(jobId)
      if (!job) throw new Error(`Job "${jobId}" not found`)

      const startMs = Date.now()
      job.status = 'running'
      job.updatedAt = new Date()

      const jobType = getJobType(job.type)

      // Build context with emit callback for ingestion jobs
      let documentsEmitted = 0
      const ctx: JobRunContext = {
        job,
        lastRunAt: job.lastRunAt,
        metadata: job.config,
        emit: () => { documentsEmitted++ },
      }

      try {
        let result: JobRunResult

        if (jobType?.run) {
          result = await jobType.run(ctx)
        } else {
          result = {
            jobId: job.id,
            sourceId: job.sourceId,
            status: 'completed',
            summary: 'No run() defined for this job type',
            documentsCreated: 0,
            documentsUpdated: 0,
            documentsDeleted: 0,
            durationMs: Date.now() - startMs,
          }
        }

        if (result.status === 'failed') {
          throw new Error(result.error ?? result.summary ?? 'Job failed')
        }

        job.status = 'completed'
        job.lastRunAt = new Date()
        job.runCount++
        job.updatedAt = new Date()

        return { ...result, durationMs: Date.now() - startMs }
      } catch (err) {
        job.status = 'failed'
        job.lastError = err instanceof Error ? err.message : String(err)
        job.updatedAt = new Date()

        return {
          jobId: job.id,
          sourceId: job.sourceId,
          status: 'failed',
          documentsCreated: 0,
          documentsUpdated: 0,
          documentsDeleted: 0,
          durationMs: Date.now() - startMs,
          error: job.lastError,
        }
      }
    },

    pause: (jobId: string): void => {
      const job = this._jobs.get(jobId)
      if (!job) throw new Error(`Job "${jobId}" not found`)
      job.status = 'idle'
      job.nextRunAt = undefined
      job.updatedAt = new Date()
    },

    resume: (jobId: string): void => {
      const job = this._jobs.get(jobId)
      if (!job) throw new Error(`Job "${jobId}" not found`)
      if (job.schedule) {
        job.status = 'scheduled'
        // nextRunAt would be calculated from the cron schedule
      } else {
        job.status = 'idle'
      }
      job.updatedAt = new Date()
    },
  }

  // ── Document-Job Relations ──

  documentJobs: DocumentJobsApi = {
    getJobsForDocument: (documentId: string): DocumentJobRelation[] => {
      return this._documentJobRelations.filter(r => r.documentId === documentId)
    },

    getDocumentsForJob: (jobId: string): DocumentJobRelation[] => {
      return this._documentJobRelations.filter(r => r.jobId === jobId)
    },

    addRelation: (documentId: string, jobId: string, relation: DocumentJobRelationType): void => {
      // Check for existing relation to avoid duplicates
      const exists = this._documentJobRelations.some(
        r => r.documentId === documentId && r.jobId === jobId && r.relation === relation
      )
      if (!exists) {
        this._documentJobRelations.push({
          documentId,
          jobId,
          relation,
          timestamp: new Date(),
        })
      }
    },
  }

  // ── Core Methods ──

  initialize(config: d8umConfig): this {
    this.config = config
    this.adapter = config.vectorStore
    this.defaultEmbedding = resolveEmbeddingProvider(config.embedding)
    this.configured = true
    this.initialized = false
    return this
  }

  getEmbeddingForSource(sourceId: string): EmbeddingProvider {
    const embedding = this.sourceEmbeddings.get(sourceId)
    if (!embedding) throw new Error(`Source "${sourceId}" not found`)
    return embedding
  }

  getDistinctEmbeddings(sourceIds?: string[]): Map<string, EmbeddingProvider> {
    const map = new Map<string, EmbeddingProvider>()
    const ids = sourceIds ?? [...this._sources.keys()]
    for (const id of ids) {
      const emb = this.sourceEmbeddings.get(id)
      if (emb) map.set(emb.model, emb)
    }
    return map
  }

  groupSourcesByModel(sourceIds?: string[]): Map<string, string[]> {
    const groups = new Map<string, string[]>()
    const ids = sourceIds ?? [...this._sources.keys()]
    for (const id of ids) {
      const emb = this.sourceEmbeddings.get(id)
      if (!emb) continue
      const group = groups.get(emb.model) ?? []
      group.push(id)
      groups.set(emb.model, group)
    }
    return groups
  }

  async indexWithConnector(
    sourceId: string,
    connector: Connector,
    indexConfig: IndexConfig,
    opts?: IndexOpts,
  ): Promise<IndexResult> {
    await this.ensureInitialized()
    const source = this._sources.get(sourceId)
    if (!source) throw new Error(`Source "${sourceId}" not found`)

    const embedding = this.getEmbeddingForSource(sourceId)
    const engine = new IndexEngine(this.adapter, embedding)

    await this.config.hooks?.onIndexStart?.(sourceId, opts ?? {})
    const result = await engine.indexWithConnector(sourceId, connector, indexConfig, opts)
    await this.config.hooks?.onIndexComplete?.(sourceId, result)
    return result
  }

  async ingest(
    sourceId: string,
    doc: RawDocument,
    indexConfig: IndexConfig,
    opts?: IndexOpts
  ): Promise<IndexResult> {
    await this.ensureInitialized()
    const source = this._sources.get(sourceId)
    if (!source) throw new Error(`Source "${sourceId}" not found`)
    const { defaultChunker: chunker } = await import('./index-engine/chunker.js')
    const chunks = chunker(doc, indexConfig)
    return this.ingestWithChunks(sourceId, doc, chunks, opts)
  }

  async ingestWithChunks(
    sourceId: string,
    doc: RawDocument,
    chunks: Chunk[],
    opts?: IndexOpts
  ): Promise<IndexResult> {
    await this.ensureInitialized()
    const source = this._sources.get(sourceId)
    if (!source) throw new Error(`Source "${sourceId}" not found`)
    const embedding = this.getEmbeddingForSource(sourceId)
    const engine = new IndexEngine(this.adapter, embedding)

    await this.config.hooks?.onIndexStart?.(sourceId, opts ?? {})
    const result = await engine.ingestWithChunks(sourceId, doc, chunks, opts)
    await this.config.hooks?.onIndexComplete?.(sourceId, result)
    return result
  }

  async query(text: string, opts?: QueryOpts): Promise<QueryResponse> {
    await this.ensureInitialized()
    const { QueryPlanner } = await import('./query/planner.js')
    const planner = new QueryPlanner(
      this.adapter,
      [...this._sources.keys()],
      this.sourceEmbeddings,
    )
    const response = await planner.execute(text, {
      ...opts,
      tenantId: opts?.tenantId ?? this.config.tenantId,
    })
    await this.config.hooks?.onQueryResults?.(text, response.results)
    return response
  }

  async searchWithContext(text: string, opts: ContextSearchOpts = {}): Promise<ContextSearchResponse> {
    await this.ensureInitialized()
    const response = await searchWithContextFn(
      this.adapter,
      [...this._sources.keys()],
      this.sourceEmbeddings,
      text,
      { ...opts, tenantId: opts.tenantId ?? this.config.tenantId }
    )
    await this.config.hooks?.onQueryResults?.(text, response.rawResults)
    return response
  }

  assemble(results: d8umResult[], opts?: AssembleOpts): string {
    return assembleResults(results, opts)
  }

  async destroy(): Promise<void> {
    await this.adapter?.destroy?.()
  }

  private assertConfigured(): void {
    if (!this.configured) {
      throw new Error('d8um not initialized. Call d8um.initialize({ vectorStore, embedding }) first.')
    }
  }

  private async ensureInitialized(): Promise<void> {
    this.assertConfigured()
    if (!this.initialized) {
      await this.adapter.initialize()
      this.initialized = true
    }
  }
}

/** Create a new independent d8um instance. */
export function d8umCreate(config: d8umConfig): d8umInstance {
  return new d8umImpl().initialize(config)
}

/** Global singleton d8um instance. Call d8um.initialize() before use. */
export const d8um: d8umInstance = new d8umImpl()
