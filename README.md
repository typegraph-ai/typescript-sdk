<div align="center">
  <img src="typegraph-logo-dark.png" alt="TypeGraph" width="50" />
  <h1>TypeGraph</h1>
  <p>A context layer for AI agents</p>
</div>

<div align="center">
  <p>
  <img src="https://img.shields.io/badge/MIT%20License-3DA639?logo=opensourceinitiative&logoColor=white" alt="MIT License" />
  <img src="https://img.shields.io/badge/TypeScript%20Native-3178C6?logo=typescript&logoColor=white" alt="TypeScript native" />
  <img src="https://img.shields.io/badge/Vercel%20Native-000000?logo=vercel&logoColor=white" alt="Vercel native" />
  <img src="https://img.shields.io/badge/PostgreSQL%20Native-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL native" />
  </p>
</div>

<div align="center">
  <p>
  <a href="#how-it-works">How It Works</a>  •  <a href="#benchmarks">Benchmarks</a>  •  <a href="#guides">Guides</a>  •  <a href="#contributing">Contributing</a>
  </p>
</div>

**TypeGraph** is a TypeScript SDK that gives AI agents ingest and retrieval for **RAG**, **graph** and **memory** in a single composable package. One SDK, one path, one Postgres database.

<div align="center">
  <h2>Why TypeGraph?</h2>
</div>

Building a context layer for AI agents in TypeScript today means cobbling together a vector DB, a graph DB, an embedding API, a caching layer, consolidation logic, and a conversation manager. The leading frameworks ([Graphiti](https://github.com/getzep/graphiti), [Mem0](https://github.com/mem0ai/mem0), [MemOS](https://github.com/MemTensor/MemOS)) are Python-first and do not unify ingest and retrieval accross **RAG**, **graph** and **memory**.

TypeGraph closes that gap:

- **Ingest + retrieval in one SDK** - not two separate tools bolted together
- **TypeScript-native** - no Python runtime, no managed service, no vendor lock-in
- **Any Postgres provider** - Neon, Supabase, Amazon RDS, Nile, Prisma, self-hosted - production-ready with pgvector
- **Vercel AI SDK integration** - memory tools and middleware for `generateText()` / `streamText()`
- **Composable** - works alongside your stack, not inside a framework
- **Per-bucket embedding models, chunking, and graph extraction rules** - different models for different content, merged at query time via RRF

TypeGraph is a focused primitive - it stores, indexes, and retrieves so you can focus on building.

<div align="center">
  <h2>How it works</h2>
</div>

### Lifecycle

TypeGraph separates infrastructure provisioning from runtime initialization:


| Method               | When to call                | What it does                                               |
| -------------------- | --------------------------- | ---------------------------------------------------------- |
| `deploy(config)`     | Once (setup script, CI/CD)  | Creates tables and extensions. Idempotent.                 |
| `initialize(config)` | Every app boot / cold start | Loads state, registers adapters. Lightweight, no DDL.      |
| `undeploy()`         | Intentional teardown        | Drops all TypeGraph tables. Refuses if any table has data. |
| `destroy()`          | App shutdown                | Closes adapter connections.                                |


> **More setup options:** [Self-Hosted Initialization](https://typegraph.ai/docs/guides/self-hosted-initialization) | [Simple RAG](https://typegraph.ai/docs/guides/simple-rag)

TypeGraph uses **composable query signals** - the caller chooses which retrieval systems to activate:


| Signal     | What It Does                                       | Default |
| ---------- | -------------------------------------------------- | ------- |
| `semantic` | Semantic embedding search against chunk embeddings | **On**  |
| `keyword`  | BM25 keyword search, fused with semantic via RRF   | Off     |
| `graph`    | Heterogeneous passage-node PPR over entities and passages | Off     |
| `memory`   | Cognitive memory recall (facts, episodes)          | Off     |


Signals compose freely - any combination works. The default (`{ semantic: true }`) gives fast semantic-only search (~10-30ms). Add signals for richer retrieval:

```ts
// Default: fast semantic search
d.query('sso')

// Semantic + keyword (hybrid)
d.query('how do I configure SSO?', { signals: { semantic: true, keyword: true } })

// All signals: semantic + keyword + graph + memory
d.query('what did Alice say about the SSO migration?', {
  signals: { semantic: true, keyword: true, graph: true, memory: true },
  userId: 'alice',
  tenantId: 'org1',
})

// Graph-only: graph-ranked evidence retrieval
d.query('how are Alice and Acme Corp connected?', {
  signals: { graph: true },
})
```

For structured graph exploration, use the graph API directly:

```ts
await d.graph.explore('plotline employees', {
  tenantId: 'org1',
  include: { entities: true, facts: true, passages: true },
  depth: 1,
})
```

When `graph` and `llm` are configured, document indexing automatically builds a knowledge graph:

1. **Triple extraction** - each chunk is analyzed to extract entities (people, organizations, places, works, etc.) and their relationships as subject-predicate-object triples
2. **Entity resolution** - entities are deduplicated across chunks using a multi-tier resolver: exact match, trigram Jaccard fuzzy matching, and vector similarity with type guards
3. **Predicate normalization** - relationship types are canonicalized via a predicate ontology (~150 types) and synonym groups to prevent graph fragmentation
4. **Cross-chunk context** - entity context accumulates across chunks within a document, improving extraction consistency

At query time, enabling the `graph` signal seeds a **Personalized PageRank** walk from fact-linked entities, direct entity matches, and dense passage seeds, traversing a heterogeneous graph of entities and passages to surface evidence-bearing chunks. When combined with `vector` and `keyword` signals, results are fused via RRF, enabling multi-hop reasoning in a single retrieval step. Composite score weights are configurable per-query via `scoreWeights`, and graph result filtering is tunable via `graphReinforcement` (`'only'`, `'prefer'`, or `'off'`).

The extraction pipeline supports configurable LLMs - using a reasoning model for extraction produces dramatically higher-quality graphs (fewer entities, richer predicate vocabulary, zero noise edges) at the cost of slower ingestion.

> **Deep dive:** [Graph RAG Guide](https://typegraph.ai/docs/guides/graph-rag) - hybrid search, per-model fan-out, embedding providers, architecture

<div align="center">
  <h2>Benchmarks</h2>
</div>

TypeGraph is evaluated on published academic benchmarks using the exact methodology (chunk sizes, scoring functions, context windows) from each source paper.

### Retrieval (Core)

Standard information retrieval benchmarks using semantic + keyword signals (BM25 with RRF fusion). Metrics are BEIR-standard at cutoff 10.


| Dataset                 | nDCG@10    | Baseline | Delta       | Source           |
| ----------------------- | ---------- | -------- | ----------- | ---------------- |
| Australian Tax Guidance | **0.7519** | 0.7431   | **+0.0088** | MLEB Leaderboard |
| MLEB-ScaLR              | **0.6607** | 0.6528   | **+0.0079** | MLEB Leaderboard |
| License TLDR            | **0.6485** | 0.5985   | **+0.0500** | MLEB Leaderboard |
| MultiHop-RAG            | **0.6429** | -        | -           | COLM 2024        |
| Legal RAG Bench         | 0.3348     | 0.3704   | -0.0356     | MLEB Leaderboard |


Baselines are text-embedding-3-small on the [MLEB Leaderboard](https://huggingface.co/spaces/isaacus/MLEB) (Isaacus). TypeGraph uses the same embedding model with chunked retrieval + document-level deduplication.

### Graph-RAG (Neural)

[GraphRAG-Bench](https://arxiv.org/abs/2506.05690) evaluates graph-augmented retrieval on long-form question answering over 20 Project Gutenberg novels. Scoring uses LLM-as-judge answer correctness (0.75 x factuality + 0.25 x semantic similarity) - a continuous 0.0-1.0 metric matching the paper's evaluation code.


| Rank   | System               | Fact Retrieval | Complex Reasoning | Contextual Summarize | Creative Generation | Overall  |
| ------ | -------------------- | -------------- | ----------------- | -------------------- | ------------------- | -------- |
| **#1** | **TypeGraph neural** | **61.7**       | 53.1              | 60.4                 | 47.7                | **58.4** |
| #2     | HippoRAG2            | 60.1           | **53.4**          | 64.1                 | **48.3**            | 56.5     |
| #3     | Fast-GraphRAG        | 57.0           | 48.5              | 56.4                 | 46.2                | 52.0     |
| #4     | GraphRAG (local)     | 49.3           | 50.9              | **64.4**             | 39.1                | 50.9     |
| #5     | RAG w/ rerank        | 60.9           | 42.9              | 51.3                 | 38.3                | 48.4     |
| #6     | LightRAG             | 58.6           | 49.1              | 48.9                 | 23.8                | 45.1     |


TypeGraph overall ACC (58.4%) is statistically significant over HippoRAG2 (56.5%) at 95% confidence [CI: 57.2%, 59.5%]. Full eval: 2,009 queries, GPT-5.4-mini generation. Baselines from arXiv:2506.05690 Table 3 (GPT-4o-mini generation). See `benchmarks/` for methodology and reproduction.


<div align="center">
  <h2>Guides</h2>
</div>


| Guide                                                                | What you'll learn                                                  |
| -------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [Self-Hosted Setup](guides/Self%20Hosted/setup.md)                   | Neon Postgres + pgvector, AI Gateway, hybrid search internals      |
| [Getting Started (Local Dev)](guides/Local%20Dev/getting-started.md) | SQLite + AI Gateway - minimal infrastructure setup                 |
| [TypeGraph Cloud](guides/TypeGraph%20Cloud/quickstart.md)            | Hosted API - just an API key                                       |
| [Agentic RAG](guides/Agentic%20RAG/overview.md)                      | Retrieval architecture, embedding providers, landscape analysis    |
| [Agentic Memory](guides/Agentic%20Memory/overview.md)                | Cognitive memory system, lifecycle, extraction, landscape analysis |

<div align="center">
  <h2>Contributing</h2>
</div>

TypeGraph is open source and contributions are welcome - new integrations, adapters, bug fixes, or documentation.

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Make your changes
4. Run `pnpm build && pnpm typecheck` to verify
5. Open a PR

<div align="center">
  <h2>Development</h2>
</div>

```bash
pnpm install          # Install dependencies
pnpm build            # Build all packages (Turborepo)
pnpm test             # Run tests
pnpm typecheck        # Type checking
```

<div align="center">
  <h2>License</h2>
</div>

[MIT](LICENSE)
