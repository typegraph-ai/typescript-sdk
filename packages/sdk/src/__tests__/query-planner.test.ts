import { describe, it, expect, beforeEach, vi } from 'vitest'
import { QueryPlanner } from '../query/planner.js'
import { createMockAdapter } from './helpers/mock-adapter.js'
import { createMockEmbedding } from './helpers/mock-embedding.js'
import { createMockBucket } from './helpers/mock-source.js'
import { createTestDocuments } from './helpers/mock-connector.js'
import { IndexEngine } from '../index-engine/engine.js'
import { defaultChunker } from '../index-engine/chunker.js'
import type { EmbeddingProvider } from '../embedding/provider.js'
import type { KnowledgeGraphBridge } from '../types/graph-bridge.js'

describe('QueryPlanner', () => {
  let adapter: ReturnType<typeof createMockAdapter>
  let embedding: ReturnType<typeof createMockEmbedding>
  let bucketIds: string[]
  let bucketEmbeddings: Map<string, EmbeddingProvider>

  beforeEach(async () => {
    adapter = createMockAdapter()
    embedding = createMockEmbedding()
    bucketIds = []
    bucketEmbeddings = new Map()

    const docs = createTestDocuments(3)
    const { bucket, ingestOptions, chunkOpts } = createMockBucket({ id: 'src-1', documents: docs })
    bucketIds.push(bucket.id)
    bucketEmbeddings.set(bucket.id, embedding)

    await adapter.deploy()
    await adapter.connect()
    const engine = new IndexEngine(adapter, embedding)
    const items = await Promise.all(docs.map(async doc => ({ doc, chunks: await defaultChunker(doc, chunkOpts) })))
    await engine.ingestBatch(bucket.id, items, ingestOptions)
  })

  it('returns results for indexed sources', async () => {
    const planner = new QueryPlanner(adapter, bucketIds, bucketEmbeddings, bucketEmbeddings)
    const response = await planner.execute('Document 1')
    expect(response.results.length).toBeGreaterThan(0)
    expect(response.results[0]!.content).toBeDefined()
  })

  it('respects count', async () => {
    const planner = new QueryPlanner(adapter, bucketIds, bucketEmbeddings, bucketEmbeddings)
    const response = await planner.execute('test query', { count: 1 })
    expect(response.results).toHaveLength(1)
  })

  it('filters to requested sources', async () => {
    const docs2 = createTestDocuments(2, 'Other')
    const { bucket: bucket2, ingestOptions: ingestOptions2, chunkOpts: chunkOpts2 } = createMockBucket({ id: 'src-2', documents: docs2 })
    bucketIds.push(bucket2.id)
    bucketEmbeddings.set(bucket2.id, embedding)
    const engine = new IndexEngine(adapter, embedding)
    const items = await Promise.all(docs2.map(async doc => ({ doc, chunks: await defaultChunker(doc, chunkOpts2) })))
    await engine.ingestBatch(bucket2.id, items, ingestOptions2)

    const planner = new QueryPlanner(adapter, bucketIds, bucketEmbeddings, bucketEmbeddings)
    const response = await planner.execute('test', { buckets: ['src-1'] })
    for (const r of response.results) {
      expect(r.document.bucketId).toBe('src-1')
    }
  })

  it('records per-source timings', async () => {
    const planner = new QueryPlanner(adapter, bucketIds, bucketEmbeddings, bucketEmbeddings)
    const response = await planner.execute('test')
    expect(response.buckets['src-1']).toBeDefined()
    expect(response.buckets['src-1']!.durationMs).toBeGreaterThanOrEqual(0)
    expect(response.buckets['src-1']!.status).toBe('ok')
  })

  it('returns empty results when no sources', async () => {
    const planner = new QueryPlanner(adapter, [], new Map(), new Map())
    const response = await planner.execute('test')
    expect(response.results).toHaveLength(0)
  })

  it('passes tenantId through', async () => {
    const planner = new QueryPlanner(adapter, bucketIds, bucketEmbeddings, bucketEmbeddings)
    const response = await planner.execute('test', { tenantId: 'tenant-1' })
    expect(response.query.tenantId).toBe('tenant-1')
  })

  it('maps results to typegraphResult shape', async () => {
    const planner = new QueryPlanner(adapter, bucketIds, bucketEmbeddings, bucketEmbeddings)
    const response = await planner.execute('Document 1')
    const result = response.results[0]!
    expect(result).toHaveProperty('content')
    expect(result).toHaveProperty('score')
    expect(result).toHaveProperty('scores')
    expect(result).toHaveProperty('document')
    expect(result).toHaveProperty('chunk')
    expect(result).toHaveProperty('metadata')
    expect(result.document).toHaveProperty('id')
    expect(result.document).toHaveProperty('bucketId')
    expect(result.chunk).toHaveProperty('index')
    expect(result.chunk).toHaveProperty('total')
  })

  it('uses "semantic" source label for indexed results', async () => {
    const planner = new QueryPlanner(adapter, bucketIds, bucketEmbeddings, bucketEmbeddings)
    const response = await planner.execute('Document 1')
    const result = response.results[0]!
    expect(result.sources).toContain('semantic')
  })

  it('returns nonzero graph scores for graph-only passage graph results', async () => {
    const firstChunk = [...adapter._chunks.values()][0]![0]!
    const knowledgeGraph: KnowledgeGraphBridge = {
      searchGraphPassages: vi.fn().mockResolvedValue({
        results: [{
          passageId: 'passage-test',
          content: firstChunk.content,
          bucketId: firstChunk.bucketId,
          documentId: firstChunk.documentId,
          chunkIndex: firstChunk.chunkIndex,
          totalChunks: firstChunk.totalChunks,
          score: 0.25,
          metadata: {},
        }],
        trace: {
          entitySeedCount: 1,
          factSeedCount: 1,
          passageSeedCount: 1,
          graphNodeCount: 3,
          graphEdgeCount: 2,
          pprNonzeroCount: 3,
          candidatesBeforeMerge: 1,
          candidatesAfterMerge: 1,
          topGraphScores: [0.25],
          selectedFactIds: ['fact-1'],
          selectedEntityIds: ['ent-1'],
          selectedPassageIds: ['passage-test'],
        },
      }),
    }
    const planner = new QueryPlanner(adapter, bucketIds, bucketEmbeddings, bucketEmbeddings, undefined, knowledgeGraph)

    const response = await planner.execute('Document 1', {
      signals: { semantic: false, keyword: false, graph: true },
      count: 1,
    })

    expect(response.results).toHaveLength(1)
    expect(response.results[0]!.sources).toContain('graph')
    expect(response.results[0]!.scores.raw.ppr).toBe(0.25)
    expect(response.results[0]!.scores.normalized.graph).toBeGreaterThan(0)
  })

  it('merges graph scores into indexed results by chunk identity', async () => {
    const firstChunk = [...adapter._chunks.values()][0]![0]!
    const knowledgeGraph: KnowledgeGraphBridge = {
      searchGraphPassages: vi.fn().mockResolvedValue({
        results: [{
          passageId: 'passage-test',
          content: `${firstChunk.content} with graph-only formatting`,
          bucketId: firstChunk.bucketId,
          documentId: firstChunk.documentId,
          chunkIndex: firstChunk.chunkIndex,
          totalChunks: firstChunk.totalChunks,
          score: 0.36,
          metadata: {},
        }],
        trace: {
          entitySeedCount: 1,
          factSeedCount: 1,
          passageSeedCount: 1,
          graphNodeCount: 3,
          graphEdgeCount: 2,
          pprNonzeroCount: 3,
          candidatesBeforeMerge: 1,
          candidatesAfterMerge: 1,
          topGraphScores: [0.36],
          selectedFactIds: ['fact-1'],
          selectedEntityIds: ['ent-1'],
          selectedPassageIds: ['passage-test'],
        },
      }),
    }
    const planner = new QueryPlanner(adapter, bucketIds, bucketEmbeddings, bucketEmbeddings, undefined, knowledgeGraph)

    const response = await planner.execute('Document 1', {
      signals: { semantic: true, keyword: false, graph: true },
      count: 10,
    })

    const merged = response.results.find(result =>
      result.document.id === firstChunk.documentId && result.chunk.index === firstChunk.chunkIndex
    )
    expect(merged).toBeDefined()
    expect(merged!.sources).toContain('graph')
    expect(merged!.scores.raw.ppr).toBe(0.36)
    expect(merged!.scores.normalized.graph).toBeGreaterThan(0)
  })

  it('surfaces a misconfigured graph bridge when searchGraphPassages is missing', async () => {
    const knowledgeGraph: KnowledgeGraphBridge = {}
    const planner = new QueryPlanner(adapter, bucketIds, bucketEmbeddings, bucketEmbeddings, undefined, knowledgeGraph)

    const response = await planner.execute('Document 1', {
      signals: { semantic: false, keyword: false, graph: true },
      count: 1,
    })

    expect(response.results).toEqual([])
    expect(response.warnings).toEqual(expect.arrayContaining([
      'Graph search failed: Knowledge graph bridge must implement searchGraphPassages for graph queries.',
    ]))
  })
})
