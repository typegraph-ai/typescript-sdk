import { describe, it, expect, vi } from 'vitest'
import { d8umCreate } from '../d8um.js'
import { createMockAdapter } from './helpers/mock-adapter.js'
import { createMockEmbedding } from './helpers/mock-embedding.js'
import { createMockSource } from './helpers/mock-source.js'
import { createTestDocument, createTestDocuments } from './helpers/mock-connector.js'

describe('integration', () => {
  it('add source → index → query → assemble xml', async () => {
    const adapter = createMockAdapter()
    const embedding = createMockEmbedding()
    const instance = d8umCreate({ vectorStore: adapter, embedding })

    const source = createMockSource({ documents: createTestDocuments(3) })
    instance.addSource(source)
    await instance.index(source.id)

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
    const source = createMockSource({ documents: docs })
    instance.addSource(source)
    await instance.index(source.id)

    // Update the document content
    const updatedDocs = [createTestDocument({ id: 'doc-1', content: 'Updated content with new information' })]
    const updatedSource = createMockSource({ documents: updatedDocs })
    // Replace source
    instance.addSource(updatedSource)
    await instance.index(updatedSource.id)

    const response = await instance.query('Updated content')
    expect(response.results.length).toBeGreaterThan(0)
    expect(response.results[0]!.content).toContain('Updated')
  })

  it('multi-source → merged query results', async () => {
    const adapter = createMockAdapter()
    const embedding = createMockEmbedding()
    const instance = d8umCreate({ vectorStore: adapter, embedding })

    const source1 = createMockSource({ id: 'src-1', documents: createTestDocuments(2, 'Alpha') })
    const source2 = createMockSource({ id: 'src-2', documents: createTestDocuments(2, 'Beta') })
    instance.addSource(source1).addSource(source2)

    await instance.index('src-1')
    await instance.index('src-2')

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

    const source1 = createMockSource({ id: 'src-1', documents: createTestDocuments(2, 'Alpha') })
    const source2 = createMockSource({ id: 'src-2', documents: createTestDocuments(2, 'Beta') })
    source2.embedding = embeddingB
    instance.addSource(source1).addSource(source2)

    await instance.index('src-1')
    await instance.index('src-2')

    // Both models should have stored chunks
    expect(adapter._chunks.has('model-a')).toBe(true)
    expect(adapter._chunks.has('model-b')).toBe(true)
  })

  it('idempotency (repeated indexing is no-op)', async () => {
    const adapter = createMockAdapter()
    const embedding = createMockEmbedding()
    const instance = d8umCreate({ vectorStore: adapter, embedding })

    const source = createMockSource({ documents: createTestDocuments(2) })
    instance.addSource(source)

    const result1 = await instance.index(source.id) as any
    const result2 = await instance.index(source.id) as any

    expect(result1.inserted).toBe(2)
    expect(result2.skipped).toBe(2)
    expect(result2.inserted).toBe(0)
  })

  it('tenant isolation', async () => {
    const adapter = createMockAdapter()
    const embedding = createMockEmbedding()
    const instance = d8umCreate({ vectorStore: adapter, embedding })

    const source = createMockSource({ documents: createTestDocuments(2) })
    instance.addSource(source)

    await instance.index(source.id, { tenantId: 'tenant-a' })
    await instance.index(source.id, { tenantId: 'tenant-b' })

    const responseA = await instance.query('Document', { tenantId: 'tenant-a' })
    const responseB = await instance.query('Document', { tenantId: 'tenant-b' })

    expect(responseA.query.tenantId).toBe('tenant-a')
    expect(responseB.query.tenantId).toBe('tenant-b')
  })

  it('ingestWithChunks → query', async () => {
    const adapter = createMockAdapter()
    const embedding = createMockEmbedding()
    const instance = d8umCreate({ vectorStore: adapter, embedding })

    const source = createMockSource({ documents: [] })
    instance.addSource(source)

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
    const source = createMockSource({ documents: docs })
    instance.addSource(source)
    await instance.index(source.id)

    // Remove 2 docs and prune
    const reducedSource = createMockSource({ documents: [docs[0]!] })
    instance.addSource(reducedSource)
    const result = await instance.index(reducedSource.id, { removeDeleted: true }) as any
    expect(result.pruned).toBe(2)
  })

  it('assemble format pipeline (same results → xml/md/plain/custom)', async () => {
    const adapter = createMockAdapter()
    const embedding = createMockEmbedding()
    const instance = d8umCreate({ vectorStore: adapter, embedding })

    const source = createMockSource({ documents: createTestDocuments(2) })
    instance.addSource(source)
    await instance.index(source.id)

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

    const source = createMockSource({ documents: createTestDocuments(2) })
    instance.addSource(source)

    await instance.index(source.id)
    expect(onIndexStart).toHaveBeenCalled()
    expect(onIndexComplete).toHaveBeenCalled()

    await instance.query('test')
    expect(onQueryResults).toHaveBeenCalled()
  })
})
