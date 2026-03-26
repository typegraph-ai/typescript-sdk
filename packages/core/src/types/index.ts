export type {
  RawDocument,
  ChunkOpts,
  Chunk,
  Connector,
} from './connector.js'

export type {
  Source,
  CreateSourceInput,
  IndexConfig,
  EmbeddingInput,
} from './source.js'

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
  ScoredChunkWithDocument,
} from './adapter.js'

export type {
  d8umQuery,
  d8umResult,
  QueryOpts,
  QueryResponse,
  AssembleOpts,
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
  DocumentScope,
  DocumentFilter,
  UpsertDocumentInput,
} from './d8um-document.js'

export type {
  JobCategory,
  JobStatus,
  JobTypeDefinition,
  ConfigField,
  Job,
  CreateJobInput,
  JobRunContext,
  JobRunResult,
  ApiClient,
  ApiResponse,
} from './job.js'

export type {
  DocumentJobRelationType,
  DocumentJobRelation,
  DocumentJobRelationFilter,
} from './document-job-relation.js'

export type { d8umHooks } from './hooks.js'
