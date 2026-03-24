import { describe, it, expect } from 'vitest'
import { assemble } from '../query/assemble.js'
import type { d8umResult } from '../types/query.js'

function makeD8umResult(overrides: Partial<d8umResult> = {}): d8umResult {
  return {
    content: 'Test passage content',
    score: 0.85,
    scores: { vector: 0.85, rrf: 0.85 },
    source: {
      id: 'src-1',
      documentId: 'doc-1',
      title: 'Test Document',
      url: 'https://example.com/doc',
      updatedAt: new Date('2024-01-01'),
    },
    chunk: { index: 0, total: 1, isNeighbor: false },
    metadata: {},
    ...overrides,
  }
}

describe('assemble', () => {
  it('defaults to XML format with context/source/passage tags', () => {
    const results = [makeD8umResult()]
    const output = assemble(results)
    expect(output).toContain('<context>')
    expect(output).toContain('</context>')
    expect(output).toContain('<source')
    expect(output).toContain('</source>')
    expect(output).toContain('<passage')
    expect(output).toContain('</passage>')
  })

  it('includes source attributes in XML', () => {
    const results = [makeD8umResult()]
    const output = assemble(results)
    expect(output).toContain('id="src-1"')
    expect(output).toContain('title="Test Document"')
    expect(output).toContain('url="https://example.com/doc"')
  })

  it('includes score in XML passage', () => {
    const results = [makeD8umResult({ score: 0.8500 })]
    const output = assemble(results)
    expect(output).toContain('score="0.8500"')
  })

  it('groups by source in XML', () => {
    const results = [
      makeD8umResult({ content: 'A', source: { ...makeD8umResult().source, id: 'src-1' } }),
      makeD8umResult({ content: 'B', source: { ...makeD8umResult().source, id: 'src-1' } }),
      makeD8umResult({ content: 'C', source: { ...makeD8umResult().source, id: 'src-2', title: 'Other' } }),
    ]
    const output = assemble(results)
    // Should have two <source> blocks
    const sourceMatches = output.match(/<source /g)
    expect(sourceMatches).toHaveLength(2)
  })

  it('escapes XML special chars', () => {
    const results = [makeD8umResult({
      content: 'Use <div> & "quotes"',
      source: { ...makeD8umResult().source, title: 'A & B <C>' },
    })]
    const output = assemble(results)
    expect(output).toContain('&amp;')
    expect(output).toContain('&lt;')
    expect(output).toContain('&gt;')
    expect(output).toContain('&quot;')
  })

  it('assembles markdown format with headings and horizontal rules', () => {
    const results = [
      makeD8umResult({ content: 'First' }),
      makeD8umResult({ content: 'Second' }),
    ]
    const output = assemble(results, { format: 'markdown' })
    expect(output).toContain('# (Test Document)')
    expect(output).toContain('First')
    expect(output).toContain('---')
    expect(output).toContain('Second')
  })

  it('assembles markdown with linked title when url present', () => {
    const results = [makeD8umResult({
      content: 'Content here',
      source: { ...makeD8umResult().source, title: 'My Page', url: 'https://example.com' },
    })]
    const output = assemble(results, { format: 'markdown' })
    expect(output).toContain('# (My Page)[https://example.com]')
  })

  it('assembles markdown with plain title when no url', () => {
    const results = [makeD8umResult({
      content: 'Content here',
      source: { ...makeD8umResult().source, title: 'FAQ Item', url: undefined },
    })]
    const output = assemble(results, { format: 'markdown' })
    expect(output).toContain('# FAQ Item')
    expect(output).not.toContain('[')
  })

  it('assembles plain format with double newlines', () => {
    const results = [
      makeD8umResult({ content: 'First' }),
      makeD8umResult({ content: 'Second' }),
    ]
    const output = assemble(results, { format: 'plain' })
    expect(output).toBe('First\n\nSecond')
  })

  it('supports custom format function', () => {
    const results = [makeD8umResult({ content: 'Test' })]
    const output = assemble(results, { format: (r) => r.map(x => x.content.toUpperCase()).join(',') })
    expect(output).toBe('TEST')
  })
})
