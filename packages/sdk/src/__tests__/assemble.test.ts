import { describe, it, expect } from 'vitest'
import { assemble } from '../query/assemble.js'
import type { QueryChunkResult, QueryResults } from '../types/query.js'

function makeChunk(overrides: Partial<QueryChunkResult> = {}): QueryChunkResult {
  return {
    content: 'Test passage content',
    score: 0.85,
    scores: { raw: { cosineSimilarity: 0.85 }, normalized: { semantic: 0.85 } },
    sources: ['semantic'],
    document: {
      id: 'doc-1',
      bucketId: 'src-1',
      title: 'Test Document',
      url: 'https://example.com/doc',
      updatedAt: new Date('2024-01-01'),
    },
    chunk: { index: 0, total: 1, isNeighbor: false },
    metadata: {},
    ...overrides,
  }
}

function makeResults(chunks: QueryChunkResult[] = [makeChunk()], overrides: Partial<QueryResults> = {}): QueryResults {
  return {
    chunks,
    facts: [],
    entities: [],
    memories: [],
    ...overrides,
  }
}

describe('assemble', () => {
  it('defaults to XML format with context/source/passage tags', () => {
    const results = makeResults()
    const output = assemble(results)
    expect(output).toContain('<context>')
    expect(output).toContain('</context>')
    expect(output).toContain('<source')
    expect(output).toContain('</source>')
    expect(output).toContain('<passage')
    expect(output).toContain('</passage>')
  })

  it('includes source attributes in XML', () => {
    const results = makeResults()
    const output = assemble(results)
    expect(output).toContain('id="src-1"')
    expect(output).toContain('title="Test Document"')
    expect(output).toContain('url="https://example.com/doc"')
  })

  it('includes score in XML passage', () => {
    const results = makeResults([makeChunk({ score: 0.8500 })])
    const output = assemble(results)
    expect(output).toContain('score="0.8500"')
  })

  it('groups by bucket in XML', () => {
    const baseDocument = makeChunk().document
    const results = makeResults([
      makeChunk({ content: 'A', document: { ...baseDocument, bucketId: 'src-1' } }),
      makeChunk({ content: 'B', document: { ...baseDocument, bucketId: 'src-1' } }),
      makeChunk({ content: 'C', document: { ...baseDocument, bucketId: 'src-2', title: 'Other' } }),
    ])
    const output = assemble(results)
    // Should have two <source> blocks
    const sourceMatches = output.match(/<source /g)
    expect(sourceMatches).toHaveLength(2)
  })

  it('escapes XML special chars', () => {
    const results = makeResults([makeChunk({
      content: 'Use <div> & "quotes"',
      document: { ...makeChunk().document, title: 'A & B <C>' },
    })])
    const output = assemble(results)
    expect(output).toContain('&amp;')
    expect(output).toContain('&lt;')
    expect(output).toContain('&gt;')
    expect(output).toContain('&quot;')
  })

  it('assembles markdown format with headings and horizontal rules', () => {
    const results = makeResults([
      makeChunk({ content: 'First' }),
      makeChunk({ content: 'Second' }),
    ])
    const output = assemble(results, { format: 'markdown' })
    expect(output).toContain('# [Test Document]')
    expect(output).toContain('First')
    expect(output).toContain('---')
    expect(output).toContain('Second')
  })

  it('assembles markdown with linked title when url present', () => {
    const results = makeResults([makeChunk({
      content: 'Content here',
      document: { ...makeChunk().document, title: 'My Page', url: 'https://example.com' },
    })])
    const output = assemble(results, { format: 'markdown' })
    expect(output).toContain('# [My Page](https://example.com)')
  })

  it('assembles markdown with plain title when no url', () => {
    const results = makeResults([makeChunk({
      content: 'Content here',
      document: { ...makeChunk().document, title: 'FAQ Item', url: undefined },
    })])
    const output = assemble(results, { format: 'markdown' })
    expect(output).toContain('# FAQ Item')
    expect(output).not.toContain('[')
  })

  it('assembles plain format with double newlines', () => {
    const results = makeResults([
      makeChunk({ content: 'First' }),
      makeChunk({ content: 'Second' }),
    ])
    const output = assemble(results, { format: 'plain' })
    expect(output).toBe('First\n\nSecond')
  })

  it('supports custom format function', () => {
    const results = makeResults([makeChunk({ content: 'Test' })])
    const output = assemble(results, { format: (r) => r.chunks.map(x => x.content.toUpperCase()).join(',') })
    expect(output).toBe('TEST')
  })

  it('renders graph evidence and memories as separate sections', () => {
    const results = makeResults([], {
      facts: [{
        id: 'fact-1',
        edgeId: 'edge-1',
        sourceEntityId: 'ent-1',
        sourceEntityName: 'Tennyson',
        targetEntityId: 'ent-2',
        targetEntityName: 'Maud',
        relation: 'WROTE',
        factText: 'Tennyson wrote Maud',
        weight: 1,
        evidenceCount: 1,
      }],
      entities: [{
        id: 'ent-1',
        name: 'Tennyson',
        entityType: 'person',
        aliases: [],
        edgeCount: 1,
      }],
      memories: [{
        id: 'mem-1',
        category: 'semantic',
        status: 'active',
        content: 'Remembered context',
        importance: 0.8,
        accessCount: 0,
        lastAccessedAt: new Date('2024-01-01'),
        metadata: {},
        scope: {},
        validAt: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
        score: 0.7,
        scores: { raw: { memorySimilarity: 0.7 }, normalized: { memory: 0.7 } },
      }],
    })

    const output = assemble(results, { format: 'markdown' })
    expect(output).toContain('# Facts')
    expect(output).toContain('Tennyson wrote Maud')
    expect(output).toContain('# Entities')
    expect(output).toContain('Tennyson')
    expect(output).toContain('# Memories')
    expect(output).toContain('Remembered context')
  })
})
