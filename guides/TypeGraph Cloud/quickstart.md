# TypeGraph Cloud Quickstart

The fastest way to get started with TypeGraph. No infrastructure to manage, no database to configure, no embedding models to choose. Just an API key.

## Prerequisites

- Node.js 18+
- A TypeGraph API key (sign up at [typegraph.ai](https://typegraph.ai))

## 1) Install

```bash
npm install @typegraph-ai/core @typegraph-ai/hosted
```

## 2) Initialize

```ts
import { typegraphHosted } from '@typegraph-ai/hosted'

// Initialize TypeGraph using the TypeGraph API key
const tg = typegraphHosted({ apiKey: process.env.TYPEGRAPH_API_KEY! })
```

That's it. TypeGraph Cloud handles embedding, storage, and retrieval for you.

## 3) Create a Bucket

```ts
// Create a bucket - a logical container for related documents
const faq = await tg.buckets.create({ name: 'faq' })
```

## 4) Ingest Documents

```ts
// Send documents to your FAQ bucket - TypeGraph handles chunking and embedding
//    document id is optional - TypeGraph generates an UUID id if none is sent, and automatically deduplicates by content hash

await tg.ingest(faq.id, [
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

// Optionally check source statuses because we're thorough?
const sources = await tg.listSources()
// [
//   { id: 'faq', status: 'ready', documentCount: 2 }
// ]
```

## 5) Query

```ts
// Query - fans out across faq (and any other sources), merges, re-ranks
const response = await tg.query('how do I configure SSO?')

// response.results contains ranked chunks from your sources:
// [
//   {
//     content: 'To enable SSO, navigate to Settings > Authentication...',
//     score: 0.9142,
//     source: { id: 'faq', title: 'How do I set up SSO?' },
//   },
//   ...
// ]
```

## 6) Assemble Results (optional)

Format the ranked chunks into structured context for your LLM.

```ts
// Assemble ranked chunks into structured LLM context
const xml = tg.assemble(response.results) // defaults to XML format
// <context>
// <source id="faq" title="How do I set up SSO?">
//   <passage score="0.9142">
//     To enable SSO, navigate to Settings > Authentication...
//   </passage>
// </source>
// ...
// </context>

// Also available as markdown:
const md = tg.assemble(response.results, { format: 'markdown' })
// # How do I set up SSO?
// To enable SSO, navigate to Settings > Authentication...
//
// ---
//...
```

## When to Use TypeGraph Cloud

TypeGraph Cloud is the best option when you want:

- **Zero infrastructure** -- no database, no embedding model, no vector store to manage
- **Fastest time to production** -- sign up, get an API key, start building
- **Managed scaling** -- TypeGraph handles storage, indexing, and retrieval performance for you

When you need full control over your data and infrastructure, see the [Self-Hosted Setup Guide](../Self%20Hosted/setup.md) or the [Local Dev Guide](../Local%20Dev/getting-started.md).
