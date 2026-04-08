# @d8um-ai/core

TypeScript SDK and open protocol for supplying context to LLMs.

## Install

```bash
npm install @d8um-ai/core
```

## Usage

```ts
import { d8umInit, d8umDeploy } from '@d8um-ai/core'

// One-time setup (creates tables)
const d = await d8umDeploy({
  vectorStore: myAdapter,
  embedding: embeddingModel,
})

// Runtime init (no DDL, ready for queries)
const d = await d8umInit({
  vectorStore: myAdapter,
  embedding: embeddingModel,
})

const bucket = await d.buckets.create({ name: 'docs' })

await d.ingest(
  [{ id: 'doc-1', content: 'Your content here', title: 'Doc 1', updatedAt: new Date(), metadata: {} }],
  { chunkSize: 512, chunkOverlap: 64, deduplicateBy: ['content'] },
  { bucketId: bucket.id }
)

const { results, context } = await d.query('How does authentication work?', { format: 'xml' })
```

## API

### Core

| Export | Description |
|--------|-------------|
| `d8umInit()` | Runtime factory — returns a ready-to-use instance |
| `d8umDeploy()` | One-time DDL provisioning — creates tables/extensions |

### Engines

| Export | Description |
|--------|-------------|
| `IndexEngine` | Chunk, embed, and store documents |
| `mergeAndRank()` | Combine and normalize results from multiple sources |
| `defaultChunker` | Built-in text chunker |

### Types

`Bucket`, `VectorStoreAdapter`, `EmbeddingProvider`, `EmbeddingConfig`, `LLMConfig`, `RawDocument`, `Chunk`, `d8umDocument`, `Visibility`, `d8umIdentity`, `QueryOpts`, `QueryResponse`, `QuerySignals`, `IndexOpts`, `IndexResult`, `IndexConfig`, `GraphBridge`, `MemoryRecord`, `Job`, `Policy`

## Related

- [d8um main repo](../../README.md)
- [Agentic RAG Guide](../../README.md#agentic-rag)
