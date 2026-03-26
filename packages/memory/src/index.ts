// Types
export type {
  MemoryCategory,
  TemporalRecord,
  MemoryRecord,
  EpisodicMemory,
  SemanticEntity,
  SemanticEdge,
  SemanticFact,
  ProceduralMemory,
  MemoryScope,
  MemoryFilter,
  MemorySearchOpts,
  MemoryStoreAdapter,
} from './types/index.js'

export {
  buildScope,
  scopeKey,
  scopeMatches,
  scopeToFilter,
} from './types/index.js'

// Temporal utilities
export {
  isActiveAt,
  isActiveBetween,
  invalidateRecord,
  expireRecord,
  createTemporal,
  temporalOverlaps,
} from './temporal.js'

// Working memory
export { WorkingMemory } from './working-memory.js'
export type { WorkingMemoryItem, WorkingMemoryConfig } from './working-memory.js'
