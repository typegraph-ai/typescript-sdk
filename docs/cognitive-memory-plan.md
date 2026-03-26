# Plan: Evolve d8um from RAG SDK to Cognitive Memory Substrate

## Context

d8um is currently a TypeScript-native RAG SDK with tri-modal retrieval, per-source embeddings, RRF score merging, and a clean job-based architecture. The goal is to evolve it into the **first TypeScript-native cognitive memory substrate for AI agents** — adding working memory, episodic recall, semantic knowledge graphs, and procedural learning, inspired by human memory systems.

The Python ecosystem has Graphiti (22.8k stars), Mem0 (47.8k stars), and MemOS (6.1k stars). **TypeScript has nothing equivalent.** d8um already owns the retrieval layer — this plan adds the memory layer on top without breaking existing functionality.

Key architecture changes since the deep research report: connectors are deprecated, jobs are the universal primitive, sources are typeless containers, and integrations export `JobTypeDefinition` objects directly.

---

## Capability Matrix: Before & After

### d8um Current vs. d8um with Cognitive Memory

| Capability | d8um Today | d8um After This Plan |
|-----------|-----------|---------------------|
| **Working memory** | None | Bounded in-memory buffer with priority eviction, `toContext()` serialization |
| **Episodic memory** | None | Timestamped event storage with session/participant tracking, reference times |
| **Semantic memory** | Flat vector search only | Entity-relationship graph with fact extraction, confidence scoring, provenance links |
| **Procedural memory** | None | Learned procedures from repeated patterns, trigger-based recall, success/failure tracking |
| **Temporal awareness** | None — no timestamps on records | Bi-temporal model (`validAt`, `invalidAt`, `createdAt`, `expiredAt`) on all memory records |
| **Knowledge graph** | None | Embedded graph layer (no external DB required), BFS/DFS traversal, subgraph extraction |
| **Edge invalidation** | None | Temporal contradiction resolution — old facts preserved with `invalidAt`, not deleted |
| **Memory lifecycle** | None | Consolidation (episodic → semantic → procedural), decay scoring, forgetting policies |
| **Memory decay** | None | Exponential decay based on recency + access frequency, configurable half-life |
| **LLM-driven extraction** | None | Two-phase pipeline: extract candidates → resolve conflicts (ADD/UPDATE/DELETE/NOOP) |
| **Entity resolution** | None | Vector similarity + alias matching for deduplication |
| **Memory feedback** | None | Natural language correction ("Actually, John works at Acme, not Beta") |
| **Multi-level scoping** | `tenantId` only | `tenantId` / `groupId` / `userId` / `agentId` / `sessionId` |
| **MCP server** | None | Full MCP integration with tools + resources for agent frameworks |
| **Vercel AI SDK** | Embeddings only | Memory tools + middleware for auto-context injection |
| **Multi-modal memory** | Text only | Text + tool traces (procedural memory from tool usage) |
| **Hybrid retrieval** | Vector + keyword (RRF) | Existing RRF + temporal recency boost + importance scoring + graph traversal |
| **Prompt assembly** | `assemble()` with XML/Markdown/Plain | `assembleWithMemory()` — RAG results + working memory + facts + episodes + procedures + graph context |

### d8um After vs. Python Competitors

| Capability | d8um (Planned) | Graphiti | Mem0 | MemOS |
|-----------|---------------|----------|------|-------|
| **Language** | TypeScript-native | Python | Python + TS client | Python (77%) |
| **Working memory** | In-memory bounded buffer | None | None | KVCacheMemory |
| **Episodic memory** | Timestamped events with scope | Episode subgraph (3-layer) | None | Partial |
| **Semantic memory** | Entity graph + facts with provenance | Entity subgraph | LLM-extracted facts | TreeTextMemory |
| **Procedural memory** | Trigger/steps with success tracking | None | Partial (memory_type flag) | Tool memory |
| **Temporal model** | Bi-temporal (4 timestamps) | Bi-temporal (4 timestamps) | `created_at`/`updated_at` only | Partial timestamps |
| **Knowledge graph** | Embedded (no graph DB required) | Requires Neo4j/FalkorDB/Kuzu | Optional add-on | Requires Neo4j |
| **Edge invalidation** | Temporal invalidation (preserved) | Temporal invalidation (preserved) | DELETE + ADD (no history) | Version management |
| **Memory lifecycle** | Consolidation + decay + forgetting | Partial (invalidation only) | Partial (LLM dedup) | MemLifecycle |
| **Memory decay** | Exponential with configurable half-life | None | None | Partial |
| **Memory feedback** | NL correction → versioned update | None | None | NL correction |
| **Multi-level scoping** | tenant/group/user/agent/session | group_id | user/agent/run | MemCube scoping |
| **MCP server** | Tools + Resources | Tools only | Tools only | Tools only |
| **Vercel AI SDK** | Tools + Middleware + Provider | None | `@mem0/vercel-ai-provider` | None |
| **DB requirements** | pgvector or SQLite-vec (existing) | Neo4j + vector DB | Qdrant (default) | Neo4j + Qdrant + Redis |
| **Infrastructure weight** | Lightweight (single DB) | Heavy (graph + vector DB) | Medium (vector DB) | Heavy (3 services) |
| **TypeScript-native** | Yes | No | Partial (client only) | No |

### Competitor Execution Patterns (Research Summary)

None of the three competitors have a job/task abstraction. All use direct imperative API calls:

| Pattern | Graphiti | Mem0 | MemOS |
|---------|---------|------|-------|
| **Core pipeline** | `add_episode()` — synchronous 11-step pipeline (4-6 LLM calls per episode) | `memory.add()` — 2-phase: extract facts → LLM decides ADD/UPDATE/DELETE/NOOP per fact | `cube.add_memory()` — event-driven, routed through MemScheduler |
| **Entity extraction** | Inline during `add_episode()`: NER → 3-tier resolution (exact/fuzzy/LLM) → edge extraction | Inline during `add()`: LLM extracts candidate facts from conversation context | MemReader parses NL → structured API calls (fast mode: chunk+embed, fine mode: LLM analysis) |
| **Contradiction handling** | LLM compares new edges against similar existing edges, sets `invalidAt` on old (preserves history) | LLM chooses DELETE+ADD (no history preserved) | Version management with rollback support |
| **Consolidation trigger** | Manual: `build_communities()`, or per-episode with `update_communities=True` | Inline: happens within every `add()` call during Update Phase | MemLifecycle state machine: Generated → Activated → Merged → Archived → Expired |
| **Scheduling** | None. External cron if needed | None. Async summary refresh only | None. Request-driven only |
| **Task abstraction** | None | None | None (MemReader routes to APIs, but no reusable task definitions) |
| **Retrieval** | Hybrid (semantic + BM25 + BFS), LLM-free, P95 ~300ms | Vector search + optional graph + optional reranker | Hybrid (vector + graph + reranking) via MemOperator |
| **MCP tools** | 6 tools: add_episode, search_facts, search_nodes, get_episodes, delete_episode, clear_graph | 9 tools: add/search/get/update/delete memory + list/delete entities | Tools via MemReader API |

**The shared pipeline all three follow:** `Input → Extract → Compare → Resolve → Store`

### d8um's Architectural Differentiator: Dual-Mode Execution

**None of the competitors let you schedule or compose memory operations as reusable tasks.** d8um's job system makes this a first-class capability. Our design uses two complementary modes:

**Imperative mode** (like competitors — for interactive use):
```ts
// Direct calls, instant results — same DX as Mem0/Graphiti
await memory.remember('Alice switched to PostgreSQL')
const facts = await memory.recall('database preferences')
await memory.correct('Actually, Alice uses MySQL now')
```

**Job mode** (unique to d8um — for automation):
```ts
// Register, schedule, compose — no competitor offers this
registerJobType(memoryConsolidationJob)
registerJobType(memoryDecayJob)

d8um.jobs.create({ type: 'memory_consolidation', schedule: '0 3 * * *' })
d8um.jobs.create({ type: 'memory_decay', schedule: '0 * * * *' })

// Run on demand
await d8um.jobs.run(consolidationJobId)
```

The imperative API (`D8umMemory`) handles the Ingest-Extract-Resolve pipeline synchronously (like Mem0's `add()`). The job system handles batch operations (consolidation, decay, community detection) as schedulable, composable tasks. This dual-mode design gives d8um the simplicity of Mem0's API with the operational maturity of a production system.

### Key Trade-offs vs. Competitors

**What d8um gains over all three:**
- Only TypeScript-native cognitive memory framework — no Python runtime needed
- Lightest infrastructure footprint — works with a single pgvector or SQLite-vec instance
- Unified retrieval + memory in one SDK — competitors are memory-only, require separate RAG
- Job system for scheduling consolidation/decay — no competitor has this
- Dual-mode execution: imperative for interactive, jobs for automation

**What Graphiti does better (and our mitigation):**
- Graphiti's 3-layer hierarchy (episodic → semantic → community) is more mature — we adopt the same pattern but with embedded graph instead of Neo4j
- Graphiti's hybrid retrieval (semantic + BM25 + BFS, no LLM at query time) is faster — our pgvector adapter already has hybrid search, we add BFS on top
- Graphiti has 754 commits of battle-tested graph logic — our embedded graph is simpler but avoids the Neo4j dependency
- Graphiti's 11-step pipeline is thorough (reflexion, 3-tier entity resolution) — we adopt the key steps but keep it leaner

**What Mem0 does better (and our mitigation):**
- Mem0's API is radically simple (`memory.add()`, `memory.search()`) — we match with `D8umMemory.remember()` and `recall()`
- Mem0's ADD/UPDATE/DELETE/NOOP model is elegant — we adopt this exact pattern for conflict resolution
- Mem0 has 24+ vector store backends — we start with pgvector + SQLite-vec (covers 90% of use cases)
- Mem0's `@mem0/vercel-ai-provider` pattern is best-in-class — we adopt the same wrapper pattern
- Mem0 has YC backing + $24M raised + 47.8k stars — d8um competes on technical merit

**What MemOS does better (and our mitigation):**
- MemOS has composable MemCube containers for memory sharing/migration — we implement `groupId` scoping + future export/import
- MemOS's MemLifecycle state machine (Generated → Activated → Merged → Archived → Expired) is well-designed — our job-based lifecycle is more flexible but we should consider adopting the state machine concept for memory record status
- MemOS supports images natively — we start with text + tool traces, image support is a future extension
- MemOS has parametric memory (LoRA fine-tuning) — out of scope for d8um; we focus on retrieval-augmented memory

**What we consciously defer:**
- Image/audio memory — text + tool traces cover the primary agent use cases
- Parametric memory (LoRA) — requires model training infrastructure, not aligned with d8um's retrieval-first approach
- Decentralized memory marketplace (MemOS's MemStore) — interesting concept but premature for v1
- External graph DB adapters (Neo4j, FalkorDB) — defined as interface, implementation deferred to demand
- 3-tier entity resolution (Graphiti's exact/fuzzy/LLM) — we start with vector similarity + alias matching, add LLM-based resolution later

---

## Phase 1: Memory Type Primitives (Foundation)

**Goal:** Establish the type system, temporal model, working memory, and memory store adapter. Zero breaking changes.

### New Package: `packages/memory/` (`@d8um/memory`)

| File | Purpose |
|------|---------|
| `package.json` | Package config. Deps: `@d8um/core`. Build: tsc, test: vitest |
| `tsconfig.json` | Extends `../../tsconfig.base.json` |
| `src/index.ts` | Barrel exports |
| `src/types/memory.ts` | Core memory interfaces: `TemporalRecord`, `MemoryRecord`, `EpisodicMemory`, `SemanticFact`, `SemanticEntity`, `SemanticEdge`, `ProceduralMemory` |
| `src/types/scope.ts` | `MemoryScope` (tenantId/groupId/userId/agentId/sessionId), `buildScope()`, `scopeKey()`, `scopeMatches()` |
| `src/types/adapter.ts` | `MemoryStoreAdapter` interface — CRUD, temporal ops, search, optional entity/edge ops |
| `src/temporal.ts` | `isActiveAt()`, `invalidateRecord()`, `expireRecord()`, `createTemporal()` |
| `src/working-memory.ts` | `WorkingMemory` class — in-memory bounded buffer with priority eviction, `toContext()` serialization |
| `src/__tests__/temporal.test.ts` | Temporal utility tests |
| `src/__tests__/working-memory.test.ts` | Buffer capacity, eviction, serialization tests |
| `src/__tests__/scope.test.ts` | Scope builder/matching tests |

### Key Type Definitions

**TemporalRecord** (bi-temporal, Graphiti-inspired):
- `validAt: Date` — when fact became true in the world
- `invalidAt?: Date` — when fact stopped being true
- `createdAt: Date` — when ingested into system
- `expiredAt?: Date` — when superseded by newer version

**MemoryRecord** extends TemporalRecord:
- `id`, `category` (episodic/semantic/procedural), `content`, `embedding?`, `importance` (0-1), `accessCount`, `lastAccessedAt`, `metadata`, `scope`

**MemoryScope** (Mem0-inspired multi-level scoping):
- `tenantId?` — org-level isolation
- `groupId?` — shared memory for a team, channel, project, or multi-participant session
- `userId?` — individual memory
- `agentId?` — specific agent's memory
- `sessionId?` — conversation session

Scoping logic: a memory is visible if the query scope matches or is a subset of the record scope. Querying `{ groupId: 'team-alpha' }` returns all group memories regardless of which `userId` created them. `groupId` enables shared knowledge across participants (e.g., "the team decided to use PostgreSQL") distinct from individual memories.

**WorkingMemory** (cognitive science — bounded ~7±2 items):
- In-memory min-heap on priority. Evicts lowest priority when `maxItems` or `maxTokens` exceeded
- `toContext()` serializes for LLM prompt injection

### Modifications to Existing Code

| File | Change |
|------|--------|
| `packages/core/src/types/job.ts` | Add `'memory'` to `JobCategory` union. Unify `run()` to return `Promise<JobRunResult>`. Add `ctx.emit()` for document production. Add `resultSchema`, `summary`, `metrics`, `data` to `JobRunResult`. |
| `packages/core/src/d8um.ts` | Update `jobs.run()` to call the single `run()` method. |

**Critical: One method — `run()` — for all jobs.**

Every job has a single `run(ctx) => Promise<JobRunResult>`. What the job does and what it returns is defined by the job itself, not by the interface:

- Ingestion jobs emit documents via `ctx.emit(doc)` and report `documentsCreated`
- Memory jobs consolidate/decay/extract and report `metrics`
- Any job can include `summary`, `data`, or arbitrary `metrics`

```ts
interface JobRunContext {
  job: Job
  client?: ApiClient
  lastRunAt?: Date
  metadata?: Record<string, unknown>
  setMetadata?: (key: string, value: unknown) => void
  /** Emit a document during ingestion. Non-ingestion jobs ignore it. */
  emit?: (doc: RawDocument) => void
}

interface JobRunResult {
  jobId: string
  sourceId?: string
  status: 'completed' | 'failed'
  summary?: string
  documentsCreated: number
  documentsUpdated: number
  documentsDeleted: number
  metrics?: Record<string, number>   // { factsExtracted: 5, contradictionsResolved: 2 }
  data?: Record<string, unknown>
  durationMs: number
  error?: string
}
```

**Dual-mode design — imperative + job:**

The imperative API (`D8umMemory.remember()`, `.recall()`, `.correct()`) calls the same underlying engines directly for instant results. The job system wraps those same engines in `JobTypeDefinition` for scheduling and automation. Same code, two entry points:

```ts
// Imperative — interactive use (like Mem0's memory.add())
await memory.remember('Alice switched to PostgreSQL')

// Job — automated, scheduled (unique to d8um)
registerJobType(memoryConsolidationJob)
d8um.jobs.create({ type: 'memory_consolidation', schedule: '0 3 * * *' })
```

**Memory jobs registered by `@d8um/memory` and `@d8um/consolidation`:**

| Job Type | Category | Description |
|----------|----------|-------------|
| `memory_conversation_ingest` | memory | Extract memories from conversation messages |
| `memory_consolidation` | memory | Promote episodic → semantic → procedural |
| `memory_decay` | memory | Apply decay scoring and forgetting policies |
| `memory_community_detection` | memory | Cluster entities, generate community summaries |
| `memory_correction` | memory | Apply NL corrections to memory records |
| `memory_procedural_promotion` | memory | Detect patterns → create procedural memories |

All are optional, schedulable, and composable:
- `registerJobType(memoryConsolidationJob)` — register
- `d8um.jobs.create({ type: 'memory_consolidation', schedule: '0 3 * * *', config: { strategies: ['episodic_to_semantic'] } })` — schedule
- `d8um.jobs.run(jobId)` — run on demand
- Override with custom config per tenant/scope
- Compose: `memory_decay` → `memory_consolidation` → `memory_community_detection`

Fully backward compatible — existing ingestion jobs with `run()` work exactly as before.

---

## Phase 2: Extraction + Graph Layer

**Goal:** LLM-driven memory extraction, entity resolution, contradiction handling, embedded graph, temporal query support.

### New Files in `packages/memory/`

| File | Purpose |
|------|---------|
| `src/extraction/extractor.ts` | `MemoryExtractor` — uses structurally-typed LLM (no AI SDK imports) to extract facts/entities/relationships from conversations. Two-phase: extract candidates → resolve conflicts (ADD/UPDATE/DELETE/NOOP, Mem0-inspired) |
| `src/extraction/prompts.ts` | Prompt templates as plain TypeScript string functions |
| `src/extraction/entity-resolver.ts` | `EntityResolver` — vector similarity on name embeddings + alias matching for dedup |
| `src/extraction/invalidation.ts` | `InvalidationEngine` — finds contradicting facts, invalidates old edges (Graphiti-inspired temporal invalidation, not deletion) |
| `src/jobs/conversation-ingest.ts` | `memory_conversation_ingest` JobTypeDefinition — ingests messages into episodic memory with extraction |

### New Package: `packages/memory-graph/` (`@d8um/memory-graph`)

| File | Purpose |
|------|---------|
| `package.json` | Deps: `@d8um/memory`, `@d8um/core` |
| `src/index.ts` | Barrel exports |
| `src/graph.ts` | `EmbeddedGraph` — stores entities/edges using existing adapter pattern. BFS/DFS traversal, subgraph extraction, `subgraphToContext()` |
| `src/pg-memory-store.ts` | `MemoryStoreAdapter` impl for pgvector. New tables: `d8um_memories`, `d8um_entities`, `d8um_edges`. Follows `SqlExecutor` pattern from pgvector adapter |
| `src/sqlite-memory-store.ts` | `MemoryStoreAdapter` impl for sqlite-vec. Same schema adapted for SQLite |
| `src/migrations.ts` | DDL for memory tables (bi-temporal columns, vector columns, JSONB metadata) |

**Key design decision:** No external graph database required. Entities and edges stored in pgvector/sqlite-vec using the same adapter patterns. Graph traversal via SQL JOINs on edge tables. Optional `GraphStoreAdapter` interface for users who want Neo4j/FalkorDB.

### Modifications to Existing Code

| File | Change |
|------|--------|
| `packages/core/src/types/query.ts` | Add optional `temporalAt?: Date`, `includeInvalidated?: boolean` to `QueryOpts` |
| `packages/core/src/query/merger.ts` | Add optional `temporalBoost?: number` to `NormalizedResult`, incorporate in `mergeAndRank` when present |
| `packages/core/src/types/hooks.ts` | Add optional `onMemoryExtracted`, `onContradictionDetected` hooks |

All changes are additive optional fields — existing behavior unchanged.

---

## Phase 3: Lifecycle + Consolidation

**Goal:** Memory promotion (episodic → semantic → procedural), decay scoring, forgetting, natural language correction.

### New Package: `packages/consolidation/` (`@d8um/consolidation`)

| File | Purpose |
|------|---------|
| `package.json` | Deps: `@d8um/memory`, `@d8um/memory-graph`, `@d8um/core` |
| `src/index.ts` | Barrel exports + `registerConsolidationJobs()` convenience function |
| `src/engine.ts` | `ConsolidationEngine` — orchestrates strategies, shared by all memory jobs below |
| `src/strategies/episodic-to-semantic.ts` | Strategy implementation: cluster episodes → extract generalized facts |
| `src/strategies/community-detection.ts` | Strategy implementation: label propagation → community summaries |
| `src/strategies/procedural-promotion.ts` | Strategy implementation: repeated patterns → ProceduralMemory |
| `src/decay.ts` | `decayScore()` — exponential decay function, configurable half-life |
| `src/forgetting.ts` | `ForgettingEngine` — three policies: archive, summarize, delete |
| `src/correction.ts` | `MemoryCorrector` — parses NL correction, finds targets, invalidates old, creates new |
| `src/jobs/consolidation-job.ts` | `memory_consolidation` JobTypeDefinition using `execute()` |
| `src/jobs/decay-job.ts` | `memory_decay` JobTypeDefinition using `execute()` |
| `src/jobs/community-detection-job.ts` | `memory_community_detection` JobTypeDefinition using `execute()` |
| `src/jobs/correction-job.ts` | `memory_correction` JobTypeDefinition using `execute()` |
| `src/jobs/procedural-promotion-job.ts` | `memory_procedural_promotion` JobTypeDefinition using `execute()` |

**Every lifecycle operation is a registered job.** Each job:
- Has its own `configSchema` for customization (e.g., decay half-life, forgetting policy, strategy selection)
- Uses `execute()` → returns `JobExecuteResult` with typed metrics
- Can be scheduled independently (`'0 3 * * *'` for nightly consolidation, `'0 * * * *'` for hourly decay)
- Can be run on demand via `d8um.jobs.run(jobId)`
- Can be composed: a dev can create a pipeline of `memory_decay` → `memory_consolidation` → `memory_community_detection`

The `registerConsolidationJobs()` convenience registers all memory jobs at once:
```ts
import { registerConsolidationJobs } from '@d8um/consolidation'
registerConsolidationJobs()  // registers all 5 memory job types
```

Or register individually for fine-grained control:
```ts
import { memoryDecayJob, memoryConsolidationJob } from '@d8um/consolidation'
registerJobType(memoryDecayJob)
registerJobType(memoryConsolidationJob)
```

### No Modifications to Existing Code

All consolidation logic operates through `MemoryStoreAdapter` interface and the job registry.

---

## Phase 4: Agent Interface

**Goal:** Unified high-level API, MCP server, Vercel AI SDK integration, enhanced context assembly.

### New Files in `packages/memory/`

| File | Purpose |
|------|---------|
| `src/d8um-memory.ts` | `D8umMemory` class — the unified developer-facing API |
| `src/assemble-with-memory.ts` | `assembleWithMemory()` — composes RAG results + memory context using existing `assemble()` helpers |

**D8umMemory API surface:**
- `remember(content, category?)` — store a memory with LLM extraction
- `recall(query, opts?)` — unified search across all memory types
- `recallFacts(query)`, `recallEpisodes(query)`, `recallProcedures(trigger)` — type-specific recall
- `correct(naturalLanguageCorrection)` — NL memory correction
- `addConversationTurn(messages)` — ingest conversation with extraction
- `getRelated(entityName, depth?)` — graph traversal
- `assembleContext(query, opts?)` — build LLM-ready context from memory
- `consolidate()`, `applyDecay()` — lifecycle operations
- `working` — WorkingMemory instance

### New Package: `packages/mcp-server/` (`@d8um/mcp-server`)

| File | Purpose |
|------|---------|
| `package.json` | Deps: `@d8um/memory`, `@modelcontextprotocol/sdk` |
| `src/server.ts` | MCP server with tools: `d8um_remember`, `d8um_recall`, `d8um_recall_facts`, `d8um_forget`, `d8um_correct`, `d8um_get_related`, `d8um_add_conversation`. Resources: `memory://facts/{scope}`, `memory://entities/{scope}`, `memory://working` |
| `src/index.ts` | `createD8umMCPServer(memory)` factory |

### New Package: `packages/vercel-ai-provider/` (`@d8um/vercel-ai-provider`)

| File | Purpose |
|------|---------|
| `package.json` | Deps: `@d8um/memory` (structural typing, no AI SDK import) |
| `src/provider.ts` | `d8umMemoryTools(memory)` — generates tool definitions for Vercel AI SDK `generateText()` |
| `src/middleware.ts` | `d8umMemoryMiddleware(memory)` — auto-injects memory context into system prompt |
| `src/index.ts` | Re-exports |

### Modifications to Existing Code

| File | Change |
|------|--------|
| `packages/core/src/query/assemble.ts` | Export internal helpers (`assembleXml`, `assembleMarkdown`, `assemblePlain`, `groupBySourceId`, `escapeXml`) so `assembleWithMemory` can reuse them |

---

## All Existing File Modifications Summary

| File | Phase | Change | Breaking? |
|------|-------|--------|-----------|
| `packages/core/src/types/job.ts` | 1 | Add `'memory'` to JobCategory, unify `run()` signature, add `ctx.emit()`, extend `JobRunResult` with `summary`/`metrics`/`data` | No |
| `packages/core/src/d8um.ts` | 1 | Update `jobs.run()` to call unified `run()` | No |
| `packages/core/src/types/query.ts` | 2 | Add optional `temporalAt`, `includeInvalidated` to QueryOpts | No |
| `packages/core/src/query/merger.ts` | 2 | Add optional `temporalBoost` to NormalizedResult | No |
| `packages/core/src/types/hooks.ts` | 2 | Add optional memory hooks | No |
| `packages/core/src/query/assemble.ts` | 4 | Export existing internal helpers | No |

**Zero breaking changes across all phases.**

---

## New Package Dependency Graph

```
@d8um/core (existing, minimal additive changes)
    ↓
@d8um/memory (Phase 1-2: types, working memory, extraction, scoping)
    ↓
@d8um/memory-graph (Phase 2: embedded graph, memory store adapters)
    ↓
@d8um/consolidation (Phase 3: lifecycle, decay, forgetting, correction)
    ↓
@d8um/mcp-server (Phase 4: MCP protocol server)
@d8um/vercel-ai-provider (Phase 4: AI SDK integration)
```

---

## Verification Plan

### Phase 1
- `pnpm --filter @d8um/memory test` — all temporal, working memory, scope tests pass
- `pnpm --filter @d8um/core typecheck` — confirms JobCategory union change is compatible
- `pnpm build` — full workspace builds without errors

### Phase 2
- `pnpm --filter @d8um/memory test` — extraction, entity resolution, invalidation tests
- `pnpm --filter @d8um/memory-graph test` — graph traversal, memory store adapter CRUD, temporal queries
- `pnpm --filter @d8um/core test` — existing tests still pass (merger, planner, assemble unchanged)

### Phase 3
- `pnpm --filter @d8um/consolidation test` — consolidation strategies, decay scoring, forgetting
- Integration test: create episodic memories → run consolidation → verify semantic facts created

### Phase 4
- `pnpm --filter @d8um/memory test` — D8umMemory unified API, assembleWithMemory
- `pnpm --filter @d8um/mcp-server test` — MCP tool invocations
- `pnpm --filter @d8um/vercel-ai-provider test` — tool generation, middleware
- `pnpm build && pnpm test && pnpm typecheck` — full workspace green

### End-to-End Smoke Test
```ts
const memory = new D8umMemory({ memoryStore, vectorStore, embedding, llm, scope: { userId: 'alice' } })
await memory.addConversationTurn([
  { role: 'user', content: 'I just switched from MySQL to PostgreSQL at work' }
])
const facts = await memory.recallFacts('database preference')
// Should find: "alice prefers/uses PostgreSQL"
const context = await memory.assembleContext('What database does Alice use?')
// Should include the fact in assembled context
```
