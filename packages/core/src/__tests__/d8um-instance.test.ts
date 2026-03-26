import { describe, it, expect, beforeEach, vi } from 'vitest'
import { d8umCreate, d8umDeploy } from '../d8um.js'
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

describe('d8umCreate', () => {
  let adapter: ReturnType<typeof createMockAdapter>
  let embedding: ReturnType<typeof createMockEmbedding>
  let instance: d8umInstance

  beforeEach(async () => {
    adapter = createMockAdapter()
    embedding = createMockEmbedding()
    instance = await d8umCreate({ vectorStore: adapter, embedding })
  })

  describe('sources.create', () => {
    it('creates a source with a generated id', async () => {
      const source = await instance.sources.create({ name: 'Test Source' })
      expect(source.id).toBeDefined()
      expect(source.name).toBe('Test Source')
      expect(source.status).toBe('active')
    })

    it('registers embedding for new source', async () => {
      const source = await instance.sources.create({ name: 'Test Source' })
      expect(instance.getEmbeddingForSource(source.id)).toBeDefined()
    })
  })

  describe('getEmbeddingForSource', () => {
    it('returns default embedding', () => {
      const { source } = createMockSource({ documents: [] })
      registerTestSource(instance, source, embedding)
      const emb = instance.getEmbeddingForSource(source.id)
      expect(emb.model).toBe(embedding.model)
    })

    it('returns per-source override', () => {
      const customEmb = createMockEmbedding({ model: 'custom-v2' })
      const { source } = createMockSource({ documents: [] })
      registerTestSource(instance, source, customEmb)
      const emb = instance.getEmbeddingForSource(source.id)
      expect(emb.model).toBe('custom-v2')
    })

    it('throws for unknown source', () => {
      expect(() => instance.getEmbeddingForSource('unknown')).toThrow('not found')
    })
  })

  describe('getDistinctEmbeddings', () => {
    it('returns unique embeddings by model name', () => {
      const { source: s1 } = createMockSource({ id: 'src-1', documents: [] })
      const { source: s2 } = createMockSource({ id: 'src-2', documents: [] })
      registerTestSource(instance, s1, embedding)
      registerTestSource(instance, s2, embedding)
      const distinct = instance.getDistinctEmbeddings()
      expect(distinct.size).toBe(1) // Both use the same default embedding
    })

    it('filters to sourceIds', () => {
      const embA = createMockEmbedding({ model: 'model-a' })
      const embB = createMockEmbedding({ model: 'model-b' })
      const { source: s1 } = createMockSource({ id: 'src-1', documents: [] })
      const { source: s2 } = createMockSource({ id: 'src-2', documents: [] })
      registerTestSource(instance, s1, embA)
      registerTestSource(instance, s2, embB)
      const distinct = instance.getDistinctEmbeddings(['src-1'])
      expect(distinct.size).toBe(1)
      expect(distinct.has('model-a')).toBe(true)
    })
  })

  describe('groupSourcesByModel', () => {
    it('groups sources by model', () => {
      const { source: s1 } = createMockSource({ id: 'src-1', documents: [] })
      const { source: s2 } = createMockSource({ id: 'src-2', documents: [] })
      const differentEmb = createMockEmbedding({ model: 'different-model' })
      registerTestSource(instance, s1, embedding)
      registerTestSource(instance, s2, differentEmb)
      const groups = instance.groupSourcesByModel()
      expect(groups.size).toBe(2)
    })
  })

  describe('indexWithConnector', () => {
    it('indexes a specific source', async () => {
      const { source, connector, indexConfig } = createMockSource({ documents: createTestDocuments(2) })
      registerTestSource(instance, source, embedding)
      const result = await instance.indexWithConnector(source.id, connector, indexConfig)
      expect(result.total).toBe(2)
    })

    it('throws for unknown source', async () => {
      const { connector, indexConfig } = createMockSource({ documents: [] })
      await expect(instance.indexWithConnector('unknown', connector, indexConfig)).rejects.toThrow('not found')
    })

    it('calls adapter.deploy and adapter.connect during d8umCreate', async () => {
      // d8umCreate calls deploy() then initialize() which calls connect()
      expect(adapter.calls.filter(c => c.method === 'deploy')).toHaveLength(1)
      expect(adapter.calls.filter(c => c.method === 'connect')).toHaveLength(1)
    })
  })

  describe('ingest', () => {
    it('ingests a single document', async () => {
      const { source, indexConfig } = createMockSource({ documents: [] })
      registerTestSource(instance, source, embedding)
      const doc = createTestDocument({ content: 'Some content to ingest' })
      const result = await instance.ingest(source.id, doc, indexConfig)
      expect(result.inserted).toBe(1)
    })
  })

  describe('query', () => {
    it('returns results', async () => {
      const { source, connector, indexConfig } = createMockSource({ documents: createTestDocuments(3) })
      registerTestSource(instance, source, embedding)
      await instance.indexWithConnector(source.id, connector, indexConfig)
      const response = await instance.query('Document 1')
      expect(response.results.length).toBeGreaterThan(0)
    })

    it('passes tenantId from config', async () => {
      const inst = await d8umCreate({ vectorStore: adapter, embedding, tenantId: 'config-tenant' })
      const { source, connector, indexConfig } = createMockSource({ documents: createTestDocuments(1) })
      registerTestSource(inst, source, embedding)
      await inst.indexWithConnector(source.id, connector, indexConfig)
      const response = await inst.query('test')
      expect(response.query.tenantId).toBe('config-tenant')
    })

    it('per-query tenantId overrides config', async () => {
      const inst = await d8umCreate({ vectorStore: adapter, embedding, tenantId: 'config-tenant' })
      const { source, connector, indexConfig } = createMockSource({ documents: createTestDocuments(1) })
      registerTestSource(inst, source, embedding)
      await inst.indexWithConnector(source.id, connector, indexConfig)
      const response = await inst.query('test', { tenantId: 'query-tenant' })
      expect(response.query.tenantId).toBe('query-tenant')
    })
  })

  describe('assemble', () => {
    it('assembles XML by default', async () => {
      const { source, connector, indexConfig } = createMockSource({ documents: createTestDocuments(1) })
      registerTestSource(instance, source, embedding)
      await instance.indexWithConnector(source.id, connector, indexConfig)
      const response = await instance.query('test')
      const xml = instance.assemble(response.results)
      expect(xml).toContain('<context>')
    })

    it('assembles plain text', async () => {
      const { source, connector, indexConfig } = createMockSource({ documents: createTestDocuments(1) })
      registerTestSource(instance, source, embedding)
      await instance.indexWithConnector(source.id, connector, indexConfig)
      const response = await instance.query('test')
      const plain = instance.assemble(response.results, { format: 'plain' })
      expect(plain).not.toContain('<context>')
    })
  })

  describe('hooks', () => {
    it('fires onIndexStart and onIndexComplete', async () => {
      const onIndexStart = vi.fn()
      const onIndexComplete = vi.fn()
      const inst = await d8umCreate({
        vectorStore: adapter,
        embedding,
        hooks: { onIndexStart, onIndexComplete },
      })
      const { source, connector, indexConfig } = createMockSource({ documents: [createTestDocument()] })
      registerTestSource(inst, source, embedding)
      await inst.indexWithConnector(source.id, connector, indexConfig)
      expect(onIndexStart).toHaveBeenCalledOnce()
      expect(onIndexComplete).toHaveBeenCalledOnce()
    })

    it('fires onQueryResults', async () => {
      const onQueryResults = vi.fn()
      const inst = await d8umCreate({
        vectorStore: adapter,
        embedding,
        hooks: { onQueryResults },
      })
      const { source, connector, indexConfig } = createMockSource({ documents: [createTestDocument()] })
      registerTestSource(inst, source, embedding)
      await inst.indexWithConnector(source.id, connector, indexConfig)
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

  describe('lifecycle', () => {
    it('deploy() calls adapter.deploy() but does not set initialized', async () => {
      const a = createMockAdapter()
      const inst = await d8umDeploy({ vectorStore: a, embedding })
      expect(a.calls.filter(c => c.method === 'deploy')).toHaveLength(1)
      expect(a.calls.filter(c => c.method === 'connect')).toHaveLength(0)
      // deploy-only instance should not be usable for runtime operations
      await expect(inst.query('test')).rejects.toThrow()
    })

    it('d8umCreate calls both deploy() and connect()', async () => {
      const a = createMockAdapter()
      await d8umCreate({ vectorStore: a, embedding })
      expect(a.calls.filter((c: { method: string }) => c.method === 'deploy')).toHaveLength(1)
      expect(a.calls.filter((c: { method: string }) => c.method === 'connect')).toHaveLength(1)
    })

    it('undeploy() delegates to adapter and clears state', async () => {
      const result = await instance.undeploy()
      expect(result.success).toBe(true)
      expect(adapter.calls.some(c => c.method === 'undeploy')).toBe(true)
    })

    it('undeploy() returns failure when adapter lacks undeploy', async () => {
      const a = createMockAdapter()
      delete (a as any).undeploy
      const inst = await d8umCreate({ vectorStore: a, embedding })
      const result = await inst.undeploy()
      expect(result.success).toBe(false)
      expect(result.message).toContain('does not support')
    })
  })
})
