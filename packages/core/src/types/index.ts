export type {
  RawDocument,
  ChunkOpts,
  Chunk,
} from './connector.js'

export type {
  Bucket,
  CreateBucketInput,
  BucketListFilter,
  IndexDefaults,
  IndexConfig,
  EmbeddingConfig,
  EmbeddingInput,
} from './bucket.js'

export type {
  EmbeddedChunk,
  ChunkFilter,
  ScoredChunk,
} from './document.js'

export type {
  SearchOpts,
  HashRecord,
  HashStoreAdapter,
  VectorStoreAdapter,
  UndeployResult,
  ScoredChunkWithDocument,
} from './adapter.js'

export type {
  QuerySignals,
  d8umResult,
  RawScores,
  NormalizedScores,
  QueryOpts,
  QueryResponse,
} from './query.js'

export type {
  IndexOpts,
  IndexProgressEvent,
  IndexResult,
} from './index-types.js'

export { IndexError } from './index-types.js'

export type {
  d8umDocument,
  DocumentStatus,
  Visibility,
  DocumentFilter,
  UpsertDocumentInput,
} from './d8um-document.js'

export type { d8umHooks } from './hooks.js'

export type { LLMProvider, LLMGenerateOptions } from './llm-provider.js'

export type { d8umIdentity } from './identity.js'

export type {
  GraphBridge,
  EntityResult,
  EntityDetail,
  EdgeResult,
  SubgraphOpts,
  SubgraphResult,
  GraphStats,
} from './graph-bridge.js'

export type { ExtractionConfig } from './extraction-config.js'

export type {
  d8umEventType,
  d8umEvent,
  TokenUsage,
  d8umEventSink,
} from './events.js'

export { D8umError, NotFoundError, NotInitializedError, ConfigError } from './errors.js'

export type {
  PolicyType,
  PolicyAction,
  PolicyRule,
  Policy,
  CreatePolicyInput,
  UpdatePolicyInput,
  PolicyEvalContext,
  PolicyDecision,
  PolicyViolation,
  PolicyStoreAdapter,
} from './policy.js'

export type {
  MemoryRecord,
  ConversationTurnResult,
  MemoryHealthReport,
} from './memory.js'

export type { d8umLogger } from './logger.js'

export type {
  PaginationOpts,
  PaginatedResult,
} from './pagination.js'

export type {
  Job,
  JobType,
  JobStatus,
  JobFilter,
} from './job.js'
