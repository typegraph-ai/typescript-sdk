// Main public API
export { d8umInit, d8umDeploy, resolveEmbeddingProvider, resolveLLMProvider, DEFAULT_BUCKET_ID } from './d8um.js'
export type { d8umConfig, d8umInstance, BucketsApi, DocumentsApi, JobsApi, GraphApi, LLMConfig } from './d8um.js'
/** @deprecated Use LLMConfig instead. */
export type { LLMInput } from './d8um.js'

// Types
export type {
  RawDocument,
  ChunkOpts,
  Chunk,
  Bucket,
  CreateBucketInput,
  BucketListFilter,
  IndexDefaults,
  IndexConfig,
  EmbeddingConfig,
  EmbeddedChunk,
  ChunkFilter,
  ScoredChunk,
  SearchOpts,
  HashRecord,
  HashStoreAdapter,
  VectorStoreAdapter,
  UndeployResult,
  ScoredChunkWithDocument,
  QuerySignals,
  d8umResult,
  RawScores,
  NormalizedScores,
  QueryOpts,
  QueryResponse,
  IndexOpts,
  IndexProgressEvent,
  IndexResult,
  d8umDocument,
  DocumentStatus,
  Visibility,
  DocumentFilter,
  UpsertDocumentInput,
  d8umHooks,
  LLMProvider,
  LLMGenerateOptions,
  d8umIdentity,
  GraphBridge,
  EntityResult,
  EntityDetail,
  EdgeResult,
  SubgraphOpts,
  SubgraphResult,
  GraphStats,
  ExtractionConfig,
  d8umEvent,
  d8umEventType,
  d8umEventSink,
  TokenUsage,
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
  MemoryRecord,
  ConversationTurnResult,
  MemoryHealthReport,
  d8umLogger,
  PaginationOpts,
  PaginatedResult,
  Job,
  JobType,
  JobStatus,
  JobFilter,
} from './types/index.js'
/** @deprecated Use EmbeddingConfig instead. */
export type { EmbeddingInput } from './types/index.js'
export { IndexError } from './types/index.js'
export { D8umError, NotFoundError, NotInitializedError, ConfigError } from './types/index.js'

// Embedding
export type { EmbeddingProvider } from './embedding/index.js'
export { aiSdkEmbeddingProvider, isAISDKEmbeddingInput } from './embedding/index.js'
export type { AISDKEmbeddingModel, AISDKEmbeddingInput } from './embedding/index.js'

// LLM
export { aiSdkLlmProvider, isAISDKLLMInput } from './llm/index.js'
export type { AISDKLanguageModel, AISDKLLMInput } from './llm/index.js'

// Governance
export { PolicyEngine, PolicyViolationError } from './governance/index.js'

// Index engine
export { IndexEngine, defaultChunker, sha256, stripMarkdown } from './index-engine/index.js'

// Query engine (internal assemble removed from public exports — use opts.format on query())
export { mergeAndRank, minMaxNormalize } from './query/index.js'
export { resolveSignals, signalLabel, computeCompositeScore, classifyQuery, type QueryClassification, type QueryType } from './query/index.js'
export type { NormalizedResult } from './query/index.js'

// Utilities
export { generateId } from './utils/id.js'

// Cloud mode
export { createCloudInstance, HttpClient, d8umApiError } from './cloud/index.js'
export type { d8umCloudInstance, CloudConfig } from './cloud/index.js'
