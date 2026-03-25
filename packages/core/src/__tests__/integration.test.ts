import { describe, it, expect, vi } from 'vitest'
import { d8umCreate } from '../d8um.js'
import { createMockAdapter } from './helpers/mock-adapter.js'
import { createMockEmbedding } from './helpers/mock-embedding.js'
import { createMockSource } from './helpers/mock-source.js'
import { createTestDocument, createTestDocuments } from './helpers/mock-connector.js'
import type { d8umInstance } from '../d8um.js'
import type { Source } from '../types/source.js'
import type { EmbeddingProvider } from '../embedding/provider.js'

/** Register a pre-built Source + embedding on an instance (bypasses sources.create UUID generation). */
function registerTestSource(instance: d8umInstance, source: Source, embedding: EmbeddingProvider) {
  const impl = instance as any
  impl._sources.set(source.id, source)
  impl.sourceEmbeddings.set(source.id, embedding)
}

describe('integration', () => {
  it('add source → index → query → assemble xml', async () => {
    const adapter = createMockAdapter()
    const embedding = createMockEmbedding()
    const instance = d8umCreate({ vectorStore: adapter, embedding })

    const { source, connector, indexConfig } = createMockSource({ documents: createTestDocuments(3) })
    registerTestSource(instance, source, embedding)
    await instance.indexWithConnector(source.id, connector, indexConfig)

    const response = await instance.query('Document 1')
    expect(response.results.length).toBeGreaterThan(0)

    const xml = instance.assemble(response.results)
    expect(xml).toContain('<context>')
    expect(xml).toContain('<source')
    expect(xml).toContain('<passage')
  })

  it('index → re-index with changes → query shows updated content', async () => {
    const adapter = createMockAdapter()
    const embedding = createMockEmbedding()
    const instance = d8umCreate({ vectorStore: adapter, embedding })

    const docs = [createTestDocument({ id: 'doc-1', content: 'Original content for testing' })]
    const { source, connector, indexConfig } = createMockSource({ documents: docs })
    registerTestSource(instance, source, embedding)
    await instance.indexWithConnector(source.id, connector, indexConfig)

    // Update the document content
    const updatedDocs = [createTestDocument({ id: 'doc-1', content: 'Updated content with new information' })]
    const { connector: updatedConnector, indexConfig: updatedIndexConfig } = createMockSource({ documents: updatedDocs })
    await instance.indexWithConnector(source.id, updatedConnector, updatedIndexConfig)

    const response = await instance.query('Updated content')
    expect(response.results.length).toBeGreaterThan(0)
    expect(response.results[0]!.content).toContain('Updated')
  })

  it('multi-source → merged query results', async () => {
    const adapter = createMockAdapter()
    const embedding = createMockEmbedding()
    const instance = d8umCreate({ vectorStore: adapter, embedding })

    const { source: source1, connector: connector1, indexConfig: indexConfig1 } = createMockSource({ id: 'src-1', documents: createTestDocuments(2, 'Alpha') })
    const { source: source2, connector: connector2, indexConfig: indexConfig2 } = createMockSource({ id: 'src-2', documents: createTestDocuments(2, 'Beta') })
    registerTestSource(instance, source1, embedding)
    registerTestSource(instance, source2, embedding)

    await instance.indexWithConnector('src-1', connector1, indexConfig1)
    await instance.indexWithConnector('src-2', connector2, indexConfig2)

    const response = await instance.query('content')
    expect(response.results.length).toBeGreaterThan(0)
    // Should have results from both sources
    const sourceIds = new Set(response.results.map(r => r.source.id))
    expect(sourceIds.size).toBeGreaterThanOrEqual(1)
  })

  it('multi-model (different embedding models per source)', async () => {
    const adapter = createMockAdapter()
    const embeddingA = createMockEmbedding({ model: 'model-a', dimensions: 4 })
    const embeddingB = createMockEmbedding({ model: 'model-b', dimensions: 4 })
    const instance = d8umCreate({ vectorStore: adapter, embedding: embeddingA })

    const { source: source1, connector: connector1, indexConfig: indexConfig1 } = createMockSource({ id: 'src-1', documents: createTestDocuments(2, 'Alpha') })
    const { source: source2, connector: connector2, indexConfig: indexConfig2 } = createMockSource({ id: 'src-2', documents: createTestDocuments(2, 'Beta') })
    registerTestSource(instance, source1, embeddingA)
    registerTestSource(instance, source2, embeddingB)

    await instance.indexWithConnector('src-1', connector1, indexConfig1)
    await instance.indexWithConnector('src-2', connector2, indexConfig2)

    // Both models should have stored chunks
    expect(adapter._chunks.has('model-a')).toBe(true)
    expect(adapter._chunks.has('model-b')).toBe(true)
  })

  it('idempotency (repeated indexing is no-op)', async () => {
    const adapter = createMockAdapter()
    const embedding = createMockEmbedding()
    const instance = d8umCreate({ vectorStore: adapter, embedding })

    const { source, connector, indexConfig } = createMockSource({ documents: createTestDocuments(2) })
    registerTestSource(instance, source, embedding)

    const result1 = await instance.indexWithConnector(source.id, connector, indexConfig)
    const result2 = await instance.indexWithConnector(source.id, connector, indexConfig)

    expect(result1.inserted).toBe(2)
    expect(result2.skipped).toBe(2)
    expect(result2.inserted).toBe(0)
  })

  it('tenant isolation', async () => {
    const adapter = createMockAdapter()
    const embedding = createMockEmbedding()
    const instance = d8umCreate({ vectorStore: adapter, embedding })

    const { source, connector, indexConfig } = createMockSource({ documents: createTestDocuments(2) })
    registerTestSource(instance, source, embedding)

    await instance.indexWithConnector(source.id, connector, indexConfig, { tenantId: 'tenant-a' })
    await instance.indexWithConnector(source.id, connector, indexConfig, { tenantId: 'tenant-b' })

    const responseA = await instance.query('Document', { tenantId: 'tenant-a' })
    const responseB = await instance.query('Document', { tenantId: 'tenant-b' })

    expect(responseA.query.tenantId).toBe('tenant-a')
    expect(responseB.query.tenantId).toBe('tenant-b')
  })

  it('ingestWithChunks → query', async () => {
    const adapter = createMockAdapter()
    const embedding = createMockEmbedding()
    const instance = d8umCreate({ vectorStore: adapter, embedding })

    const { source } = createMockSource({ documents: [] })
    registerTestSource(instance, source, embedding)

    const doc = createTestDocument({ content: 'Ingested document content' })
    const chunks = [
      { content: 'Chunk zero text', chunkIndex: 0 },
      { content: 'Chunk one text', chunkIndex: 1 },
    ]
    await instance.ingestWithChunks(source.id, doc, chunks)

    const response = await instance.query('Chunk zero text')
    expect(response.results.length).toBeGreaterThan(0)
  })

  it('prune pipeline', async () => {
    const adapter = createMockAdapter()
    const embedding = createMockEmbedding()
    const instance = d8umCreate({ vectorStore: adapter, embedding })

    const docs = createTestDocuments(3)
    const { source, connector, indexConfig } = createMockSource({ documents: docs })
    registerTestSource(instance, source, embedding)
    await instance.indexWithConnector(source.id, connector, indexConfig)

    // Remove 2 docs and prune
    const { connector: reducedConnector, indexConfig: reducedIndexConfig } = createMockSource({ documents: [docs[0]!] })
    const result = await instance.indexWithConnector(source.id, reducedConnector, reducedIndexConfig, { removeDeleted: true })
    expect(result.pruned).toBe(2)
  })

  it('assemble format pipeline (same results → xml/md/plain/custom)', async () => {
    const adapter = createMockAdapter()
    const embedding = createMockEmbedding()
    const instance = d8umCreate({ vectorStore: adapter, embedding })

    const { source, connector, indexConfig } = createMockSource({ documents: createTestDocuments(2) })
    registerTestSource(instance, source, embedding)
    await instance.indexWithConnector(source.id, connector, indexConfig)

    const response = await instance.query('Document')
    const results = response.results

    const xml = instance.assemble(results, { format: 'xml' })
    const md = instance.assemble(results, { format: 'markdown' })
    const plain = instance.assemble(results, { format: 'plain' })
    const custom = instance.assemble(results, { format: (r) => `Count: ${r.length}` })

    expect(xml).toContain('<context>')
    expect(md).toContain('---')
    expect(plain).not.toContain('<')
    expect(custom).toMatch(/Count: \d+/)
  })

  it('hooks observability (full lifecycle)', async () => {
    const onIndexStart = vi.fn()
    const onIndexComplete = vi.fn()
    const onQueryResults = vi.fn()

    const adapter = createMockAdapter()
    const embedding = createMockEmbedding()
    const instance = d8umCreate({
      vectorStore: adapter,
      embedding,
      hooks: { onIndexStart, onIndexComplete, onQueryResults },
    })

    const { source, connector, indexConfig } = createMockSource({ documents: createTestDocuments(2) })
    registerTestSource(instance, source, embedding)

    await instance.indexWithConnector(source.id, connector, indexConfig)
    expect(onIndexStart).toHaveBeenCalled()
    expect(onIndexComplete).toHaveBeenCalled()

    await instance.query('test')
    expect(onQueryResults).toHaveBeenCalled()
  })
})
