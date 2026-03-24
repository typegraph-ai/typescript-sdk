import { describe, it, expect, beforeEach } from 'vitest'
import { QueryPlanner } from '../query/planner.js'
import { createMockAdapter } from './helpers/mock-adapter.js'
import { createMockEmbedding } from './helpers/mock-embedding.js'
import { createMockSource } from './helpers/mock-source.js'
import { createTestDocuments } from './helpers/mock-connector.js'
import { IndexEngine } from '../index-engine/engine.js'
import type { d8umSource } from '../types/source.js'
import type { EmbeddingProvider } from '../embedding/provider.js'

describe('QueryPlanner', () => {
  let adapter: ReturnType<typeof createMockAdapter>
  let embedding: ReturnType<typeof createMockEmbedding>
  let sources: Map<string, d8umSource>
  let sourceEmbeddings: Map<string, EmbeddingProvider>

  beforeEach(async () => {
    adapter = createMockAdapter()
    embedding = createMockEmbedding()
    sources = new Map()
    sourceEmbeddings = new Map()

    // Set up an indexed source with some documents
    const docs = createTestDocuments(3)
    const source = createMockSource({ id: 'src-1', documents: docs })
    sources.set('src-1', source)
    sourceEmbeddings.set('src-1', embedding)

    // Index the documents
    await adapter.initialize()
    const engine = new IndexEngine(adapter, embedding)
    await engine.indexSource(source)
  })

  it('returns results for indexed sources', async () => {
    const planner = new QueryPlanner(adapter, sources, sourceEmbeddings)
    const response = await planner.execute('Document 1')
    expect(response.results.length).toBeGreaterThan(0)
    expect(response.results[0]!.content).toBeDefined()
  })

  it('respects count', async () => {
    const planner = new QueryPlanner(adapter, sources, sourceEmbeddings)
    const response = await planner.execute('test query', { count: 1 })
    expect(response.results).toHaveLength(1)
  })

  it('filters to requested sources', async () => {
    // Add a second source
    const docs2 = createTestDocuments(2, 'Other')
    const source2 = createMockSource({ id: 'src-2', documents: docs2 })
    sources.set('src-2', source2)
    sourceEmbeddings.set('src-2', embedding)
    const engine = new IndexEngine(adapter, embedding)
    await engine.indexSource(source2)

    const planner = new QueryPlanner(adapter, sources, sourceEmbeddings)
    const response = await planner.execute('test', { sources: ['src-1'] })
    for (const r of response.results) {
      expect(r.source.id).toBe('src-1')
    }
  })

  it('records per-source timings', async () => {
    const planner = new QueryPlanner(adapter, sources, sourceEmbeddings)
    const response = await planner.execute('test')
    expect(response.sources['src-1']).toBeDefined()
    expect(response.sources['src-1']!.durationMs).toBeGreaterThanOrEqual(0)
    expect(response.sources['src-1']!.status).toBe('ok')
  })

  it('warns about live and cached sources', async () => {
    const liveSource: d8umSource = {
      id: 'live-1',
      connector: { async query() { return [] } },
      mode: 'live',
    }
    sources.set('live-1', liveSource)
    sourceEmbeddings.set('live-1', embedding)

    const planner = new QueryPlanner(adapter, sources, sourceEmbeddings)
    const response = await planner.execute('test')
    expect(response.warnings).toBeDefined()
    expect(response.warnings!.some(w => w.includes('live'))).toBe(true)
  })

  it('returns empty results when no sources', async () => {
    const planner = new QueryPlanner(adapter, new Map(), new Map())
    const response = await planner.execute('test')
    expect(response.results).toHaveLength(0)
  })

  it('passes tenantId through', async () => {
    const planner = new QueryPlanner(adapter, sources, sourceEmbeddings)
    const response = await planner.execute('test', { tenantId: 'tenant-1' })
    expect(response.query.tenantId).toBe('tenant-1')
  })

  it('maps results to d8umResult shape', async () => {
    const planner = new QueryPlanner(adapter, sources, sourceEmbeddings)
    const response = await planner.execute('Document 1')
    const result = response.results[0]!
    expect(result).toHaveProperty('content')
    expect(result).toHaveProperty('score')
    expect(result).toHaveProperty('scores')
    expect(result).toHaveProperty('source')
    expect(result).toHaveProperty('chunk')
    expect(result).toHaveProperty('metadata')
    expect(result.source).toHaveProperty('id')
    expect(result.source).toHaveProperty('documentId')
    expect(result.chunk).toHaveProperty('index')
    expect(result.chunk).toHaveProperty('total')
  })
})
