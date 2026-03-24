import { describe, it, expect, beforeEach, vi } from 'vitest'
import { d8umCreate } from '../d8um.js'
import { createMockAdapter } from './helpers/mock-adapter.js'
import { createMockEmbedding } from './helpers/mock-embedding.js'
import { createMockSource } from './helpers/mock-source.js'
import { createTestDocument, createTestDocuments } from './helpers/mock-connector.js'
import type { d8umInstance } from '../d8um.js'

describe('d8umCreate', () => {
  let adapter: ReturnType<typeof createMockAdapter>
  let embedding: ReturnType<typeof createMockEmbedding>
  let instance: d8umInstance

  beforeEach(() => {
    adapter = createMockAdapter()
    embedding = createMockEmbedding()
    instance = d8umCreate({ vectorStore: adapter, embedding })
  })

  describe('addSource', () => {
    it('creates instance and adds source', () => {
      const source = createMockSource({ documents: [] })
      instance.addSource(source)
      expect(instance.getEmbeddingForSource(source.id)).toBeDefined()
    })

    it('returns this for chaining', () => {
      const source = createMockSource({ documents: [] })
      const result = instance.addSource(source)
      expect(result).toBe(instance)
    })

    it('throws for indexed without index config', () => {
      const source = createMockSource({ mode: 'indexed', documents: [] })
      delete (source as any).index
      expect(() => instance.addSource(source)).toThrow("requires an index config")
    })

    it('throws for cached without cache config', () => {
      expect(() => instance.addSource({
        id: 'cached-src',
        connector: {},
        mode: 'cached',
      })).toThrow("requires a cache config")
    })

    it('throws for live without query method', () => {
      expect(() => instance.addSource({
        id: 'live-src',
        connector: {},
        mode: 'live',
      })).toThrow("requires connector.query()")
    })
  })

  describe('getEmbeddingForSource', () => {
    it('returns default embedding', () => {
      const source = createMockSource({ documents: [] })
      instance.addSource(source)
      const emb = instance.getEmbeddingForSource(source.id)
      expect(emb.model).toBe(embedding.model)
    })

    it('returns per-source override', () => {
      const customEmb = createMockEmbedding({ model: 'custom-v2' })
      const source = createMockSource({ documents: [] })
      source.embedding = customEmb
      instance.addSource(source)
      const emb = instance.getEmbeddingForSource(source.id)
      expect(emb.model).toBe('custom-v2')
    })

    it('throws for unknown source', () => {
      expect(() => instance.getEmbeddingForSource('unknown')).toThrow('not found')
    })
  })

  describe('getDistinctEmbeddings', () => {
    it('returns unique embeddings by model name', () => {
      const s1 = createMockSource({ id: 'src-1', documents: [] })
      const s2 = createMockSource({ id: 'src-2', documents: [] })
      instance.addSource(s1).addSource(s2)
      const distinct = instance.getDistinctEmbeddings()
      expect(distinct.size).toBe(1) // Both use the same default embedding
    })

    it('filters to sourceIds', () => {
      const s1 = createMockSource({ id: 'src-1', documents: [] })
      s1.embedding = createMockEmbedding({ model: 'model-a' })
      const s2 = createMockSource({ id: 'src-2', documents: [] })
      s2.embedding = createMockEmbedding({ model: 'model-b' })
      instance.addSource(s1).addSource(s2)
      const distinct = instance.getDistinctEmbeddings(['src-1'])
      expect(distinct.size).toBe(1)
      expect(distinct.has('model-a')).toBe(true)
    })
  })

  describe('groupSourcesByModel', () => {
    it('groups sources by model', () => {
      const s1 = createMockSource({ id: 'src-1', documents: [] })
      const s2 = createMockSource({ id: 'src-2', documents: [] })
      s2.embedding = createMockEmbedding({ model: 'different-model' })
      instance.addSource(s1).addSource(s2)
      const groups = instance.groupSourcesByModel()
      expect(groups.size).toBe(2)
    })
  })

  describe('index', () => {
    it('indexes a specific source', async () => {
      const source = createMockSource({ documents: createTestDocuments(2) })
      instance.addSource(source)
      const result = await instance.index(source.id)
      expect((result as any).total).toBe(2)
    })

    it('indexes all sources', async () => {
      const s1 = createMockSource({ id: 'src-1', documents: createTestDocuments(2) })
      const s2 = createMockSource({ id: 'src-2', documents: createTestDocuments(1, 'Other') })
      instance.addSource(s1).addSource(s2)
      const results = await instance.index()
      expect(Array.isArray(results)).toBe(true)
      expect((results as any[]).length).toBe(2)
    })

    it('throws for unknown source', async () => {
      await expect(instance.index('unknown')).rejects.toThrow('not found')
    })

    it('throws for non-indexed source', async () => {
      instance.addSource({
        id: 'live-src',
        connector: { async query() { return [] } },
        mode: 'live',
      })
      await expect(instance.index('live-src')).rejects.toThrow('not indexed')
    })

    it('calls adapter.initialize lazily', async () => {
      const source = createMockSource({ documents: [createTestDocument()] })
      instance.addSource(source)
      expect(adapter.calls.filter(c => c.method === 'initialize')).toHaveLength(0)
      await instance.index(source.id)
      expect(adapter.calls.filter(c => c.method === 'initialize')).toHaveLength(1)
    })
  })

  describe('query', () => {
    it('returns results', async () => {
      const source = createMockSource({ documents: createTestDocuments(3) })
      instance.addSource(source)
      await instance.index(source.id)
      const response = await instance.query('Document 1')
      expect(response.results.length).toBeGreaterThan(0)
    })

    it('passes tenantId from config', async () => {
      const inst = d8umCreate({ vectorStore: adapter, embedding, tenantId: 'config-tenant' })
      const source = createMockSource({ documents: createTestDocuments(1) })
      inst.addSource(source)
      await inst.index(source.id)
      const response = await inst.query('test')
      expect(response.query.tenantId).toBe('config-tenant')
    })

    it('per-query tenantId overrides config', async () => {
      const inst = d8umCreate({ vectorStore: adapter, embedding, tenantId: 'config-tenant' })
      const source = createMockSource({ documents: createTestDocuments(1) })
      inst.addSource(source)
      await inst.index(source.id)
      const response = await inst.query('test', { tenantId: 'query-tenant' })
      expect(response.query.tenantId).toBe('query-tenant')
    })
  })

  describe('assemble', () => {
    it('assembles XML by default', async () => {
      const source = createMockSource({ documents: createTestDocuments(1) })
      instance.addSource(source)
      await instance.index(source.id)
      const response = await instance.query('test')
      const xml = instance.assemble(response.results)
      expect(xml).toContain('<context>')
    })

    it('assembles plain text', async () => {
      const source = createMockSource({ documents: createTestDocuments(1) })
      instance.addSource(source)
      await instance.index(source.id)
      const response = await instance.query('test')
      const plain = instance.assemble(response.results, { format: 'plain' })
      expect(plain).not.toContain('<context>')
    })
  })

  describe('hooks', () => {
    it('fires onIndexStart and onIndexComplete', async () => {
      const onIndexStart = vi.fn()
      const onIndexComplete = vi.fn()
      const inst = d8umCreate({
        vectorStore: adapter,
        embedding,
        hooks: { onIndexStart, onIndexComplete },
      })
      const source = createMockSource({ documents: [createTestDocument()] })
      inst.addSource(source)
      await inst.index(source.id)
      expect(onIndexStart).toHaveBeenCalledOnce()
      expect(onIndexComplete).toHaveBeenCalledOnce()
    })

    it('fires onQueryResults', async () => {
      const onQueryResults = vi.fn()
      const inst = d8umCreate({
        vectorStore: adapter,
        embedding,
        hooks: { onQueryResults },
      })
      const source = createMockSource({ documents: [createTestDocument()] })
      inst.addSource(source)
      await inst.index(source.id)
      await inst.query('test')
      expect(onQueryResults).toHaveBeenCalledOnce()
    })
  })

  describe('destroy', () => {
    it('calls adapter destroy', async () => {
      await instance.destroy()
      expect(adapter.calls.some(c => c.method === 'destroy')).toBe(true)
    })
  })
})
