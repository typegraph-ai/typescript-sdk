# TypeGraph Local Dev Getting Started

Minimal infrastructure setup — SQLite for storage, AI Gateway for embeddings. No database server needed.

## Prerequisites

- Node.js 18+
- A [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) API key (or any AI SDK-compatible embedding provider)

## 1) Install

```bash
# Core SDK
npm install @typegraph-ai/core

# AI Gateway — access 40+ embedding providers through one dependency
npm install @ai-sdk/gateway

# SQLite vector store — zero-infra, single-file database
npm install @typegraph-ai/adapter-sqlite-vec
```

## 2) Initialize

```ts
import { typegraph } from '@typegraph-ai/core'
import { gateway } from '@ai-sdk/gateway'
import { SqliteVecAdapter } from '@typegraph-ai/adapter-sqlite-vec'

const config = {
  embedding: {
    model: gateway.embeddingModel('openai/text-embedding-3-small'),
    dimensions: 1536,
  },
  vectorStore: new SqliteVecAdapter({ dbPath: './my-app.db' }),
}

// One-time setup — creates tables
await typegraph.deploy(config)

// Runtime init — lightweight, no DDL
await typegraph.initialize(config)
```

### Under the Hood: Local Initialization

- `SqliteVecAdapter` creates a SQLite database file at `./my-app.db`
- Tables are created: `typegraph_chunks_registry`, `typegraph_hashes`
- Embeddings are generated via the AI Gateway — swap models by changing a string

## 3) Create a Bucket

```ts
const faq = await typegraph.buckets.create({ name: 'faq' })
```

### Under the Hood: SQLite Tables

TypeGraph creates a per-model chunks table for the embedding model:

```sql
typegraph_chunks_gateway_openai_text_embedding_3_small (
  chunk_rowid     INTEGER PRIMARY KEY AUTOINCREMENT,
  id              TEXT,
  bucket_id       TEXT,
  document_id     TEXT,
  content         TEXT,
  embedding_model TEXT,
  chunk_index     INTEGER,
  ...
)

-- sqlite-vec virtual table for vector search
typegraph_chunks_gateway_openai_text_embedding_3_small_vec
  embedding float[1536]   -- 1536-dim vectors for cosine similarity search
```

## 4) Ingest Documents

```ts
await typegraph.ingest(faq.id, [
  {
    title: 'How do I set up SSO?',
    content: 'To enable SSO, navigate to Settings > Authentication and select your identity provider. We support SAML 2.0 and OpenID Connect.',
    updatedAt: new Date(),
    metadata: {},
  },
  {
    title: 'How do I reset my password?',
    content: 'Click "Forgot password" on the login page. You will receive a reset link via email within 5 minutes.',
    updatedAt: new Date(),
    metadata: {},
  },
], { chunkSize: 512, chunkOverlap: 64, deduplicateBy: ['content'] })
```

### Under the Hood: Local Ingestion Pipeline

For each document, TypeGraph:

1. Hashes the content for deduplication
2. Checks `typegraph_hashes` -- skips if content unchanged
3. Chunks the content based on `chunkSize`/`chunkOverlap`
4. Sends chunks to the AI Gateway for embedding
5. Inserts chunks into the SQLite chunks table
6. Inserts embeddings into the sqlite-vec virtual table
7. Updates `typegraph_hashes` for deduplication on next run

## 5) Query

```ts
const response = await typegraph.query('how do I configure SSO?')

// response.results contains ranked chunks:
// [
//   {
//     content: 'To enable SSO, navigate to Settings > Authentication...',
//     score: 0.9142,
//     source: { id: 'faq', title: 'How do I set up SSO?' },
//   },
//   ...
// ]
```

### Under the Hood: Local Vector Search

TypeGraph queries locally against the SQLite file:

1. Embeds the query text via the AI Gateway
2. Runs a KNN search against the sqlite-vec virtual table:

```sql
SELECT c.*, v.distance
FROM typegraph_chunks_gateway_openai_text_embedding_3_small_vec v
JOIN typegraph_chunks_gateway_openai_text_embedding_3_small c ON c.chunk_rowid = v.rowid
WHERE v.embedding MATCH ? AND k = 10
ORDER BY v.distance
```

3. Converts cosine distance to similarity scores
4. Returns ranked results

## 6) Assemble Results (optional)

```ts
const xml = typegraph.assemble(response.results) // defaults to XML
// <context>
// <source id="faq" title="How do I set up SSO?">
//   <passage score="0.9142">
//     To enable SSO, navigate to Settings > Authentication...
//   </passage>
// </source>
// ...
// </context>
```

## When to Use Local Dev

The local dev setup is the best option for:

- **Local development** -- iterate fast without a database server
- **Testing** -- reproducible results with a single-file database
- **CI/CD pipelines** -- no external database infrastructure to manage
- **Edge deployments** -- SQLite runs anywhere

When you're ready for production, swap in pgvector — the rest of your code stays the same. See the [Self-Hosted Setup Guide](../Self%20Hosted/setup.md) for the production path with Neon Postgres, or the [TypeGraph Cloud Quickstart](../TypeGraph%20Cloud/quickstart.md) for the zero-infrastructure option.
