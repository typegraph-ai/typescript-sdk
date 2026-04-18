# @typegraph-ai/adapter-pgvector

PostgreSQL + [pgvector](https://github.com/pgvector/pgvector) adapter for TypeGraph. Hybrid search combining vector similarity with keyword matching via `tsvector` and Reciprocal Rank Fusion.

Bring your own Postgres driver -- works with Neon serverless, node-postgres, Drizzle, or anything that can run a parameterized query. Per-model table isolation keeps embedding dimensions and indexes clean.

## Install

```bash
npm install @typegraph-ai/adapter-pgvector @typegraph-ai/core
```

## Usage

```ts
import { neon } from '@neondatabase/serverless'
import { PgVectorAdapter } from '@typegraph-ai/adapter-pgvector'
import { typegraph } from '@typegraph-ai/core'

const sql = neon(process.env.DATABASE_URL!)

const adapter = new PgVectorAdapter({ sql })

const agent = await typegraph.initialize({
  adapter,
  // ... embedding provider, etc.
})
```

The `SqlExecutor` pattern means you wire up the driver yourself:

```ts
// node-postgres
import { Pool } from 'pg'
const pool = new Pool({ connectionString: '...' })
const sql: SqlExecutor = (q, p) => pool.query(q, p).then(r => r.rows)
```

## Exports

| Export | Description |
|--------|-------------|
| `PgVectorAdapter` | Main adapter class, implements `VectorStoreAdapter` |
| `PgHashStore` | Content-hash deduplication store |
| `PgDocumentStore` | Document record CRUD |
| `REGISTRY_SQL` | DDL for model registry table |
| `MODEL_TABLE_SQL` | DDL for per-model chunk tables |
| `HASH_TABLE_SQL` | DDL for hash deduplication table |
| `DOCUMENTS_TABLE_SQL` | DDL for documents table |
| `BUCKETS_TABLE_SQL` | DDL for buckets table |
| `JOBS_TABLE_SQL` | DDL for jobs table |
| `sanitizeModelKey` | Normalizes model names into safe table suffixes |

## Types

| Type | Description |
|------|-------------|
| `PgVectorAdapterConfig` | Constructor options (`sql`, `transaction`, `schema`, `tablePrefix`, `hashesTable`, `documentsTable`) |
| `SqlExecutor` | `(query: string, params?: unknown[]) => Promise<Record<string, unknown>[]>` |

## Related

- [TypeGraph main repo](../..)
- [Self-Hosted Setup Guide](../../guides/Self%20Hosted/setup.md)
