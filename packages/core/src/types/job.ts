/**
 * Jobs are the universal "do something" primitive in d8um.
 *
 * Each job has a type that determines what it does, a config that holds
 * type-specific parameters, and an optional schedule for recurring execution.
 *
 * Jobs are not limited to ingestion. The same system handles:
 * - Ingestion: url_scrape, domain_crawl, file_upload, slack_sync, etc.
 * - Processing (future): reindex, re_embed, content_cleanup
 * - Export (future): export_csv, webhook_notify
 * - Maintenance (future): source_health_check, stale_document_cleanup
 * - Custom: user-defined jobs with arbitrary config
 */

export type JobCategory = 'ingestion' | 'processing' | 'export' | 'maintenance' | 'custom'
export type JobStatus = 'idle' | 'running' | 'completed' | 'failed' | 'scheduled'

/**
 * Defines a job type in the registry. Job types are defined in code
 * (not in the database), providing type safety, validation, and UI metadata.
 */
export interface JobTypeDefinition {
  /** Unique identifier for this job type, e.g. 'url_scrape', 'slack_messages' */
  type: string
  /** Human-readable name */
  label: string
  /** What this job does */
  description: string
  category: JobCategory
  /** Must this job target a source? Ingestion jobs require one; others may not. */
  requiresSource: boolean
  /** Is this job type currently implemented and available for use? */
  available: boolean
  /** Expected config shape for validation + UI generation */
  configSchema: ConfigField[]
}

export interface ConfigField {
  /** Config JSONB key */
  key: string
  /** Human-readable label */
  label: string
  type: 'text' | 'url' | 'number' | 'boolean' | 'select'
  placeholder?: string | undefined
  required: boolean
  options?: { value: string; label: string }[] | undefined
}

/**
 * A job instance — a configured execution unit.
 */
export interface Job {
  id: string
  tenantId?: string | undefined
  /** Nullable FK to Source. Ingestion jobs target a source; other types may not. */
  sourceId?: string | undefined
  /** References a JobTypeDefinition.type */
  type: string
  /** User-defined label, e.g. "Nightly blog crawl" */
  name: string
  description?: string | undefined
  /** Type-specific parameters */
  config: Record<string, unknown>
  /** Cron expression for recurring execution; null = manual/one-shot */
  schedule?: string | undefined
  status: JobStatus
  lastRunAt?: Date | undefined
  nextRunAt?: Date | undefined
  runCount: number
  lastError?: string | undefined
  createdAt: Date
  updatedAt: Date
}

export interface CreateJobInput {
  name: string
  type: string
  sourceId?: string | undefined
  tenantId?: string | undefined
  config?: Record<string, unknown> | undefined
  schedule?: string | undefined
  description?: string | undefined
}

/**
 * Context passed to a job's run function.
 * For integration-backed jobs, `client` is an auth-agnostic API client
 * provided by the consuming application (e.g. Nango-backed in d8um-app).
 */
export interface JobRunContext {
  job: Job
  /** Auth-agnostic API client for integration jobs */
  client?: ApiClient | undefined
  /** For incremental jobs — when was the last successful run? */
  lastRunAt?: Date | undefined
  /** Persisted cursor/page state between runs */
  metadata?: Record<string, unknown> | undefined
  /** Persist a metadata key for the next run */
  setMetadata?: ((key: string, value: unknown) => void) | undefined
}

export interface JobRunResult {
  jobId: string
  sourceId?: string | undefined
  status: 'completed' | 'failed'
  documentsCreated: number
  documentsUpdated: number
  documentsDeleted: number
  durationMs: number
  error?: string | undefined
}

/**
 * Auth-agnostic API client for integration jobs.
 * The consuming application provides the implementation.
 * For example, d8um-app wraps Nango's proxy() behind this interface.
 */
export interface ApiClient {
  get<T = unknown>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>>
  post<T = unknown>(endpoint: string, data?: unknown): Promise<ApiResponse<T>>
  put<T = unknown>(endpoint: string, data?: unknown): Promise<ApiResponse<T>>
  patch<T = unknown>(endpoint: string, data?: unknown): Promise<ApiResponse<T>>
  delete<T = unknown>(endpoint: string): Promise<ApiResponse<T>>
}

export interface ApiResponse<T> {
  data: T
  status: number
  headers: Record<string, string>
}
