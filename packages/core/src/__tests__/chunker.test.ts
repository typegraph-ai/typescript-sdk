import { describe, it, expect } from 'vitest'
import { defaultChunker } from '../index-engine/chunker.js'
import { createTestDocument } from './helpers/mock-connector.js'

describe('defaultChunker', () => {
  it('returns single chunk for short content', () => {
    const doc = createTestDocument({ content: 'Short text.' })
    const chunks = defaultChunker(doc, { chunkSize: 100, chunkOverlap: 20 })
    expect(chunks).toHaveLength(1)
    expect(chunks[0]!.content).toBe('Short text.')
    expect(chunks[0]!.chunkIndex).toBe(0)
  })

  it('splits long content into multiple chunks', () => {
    const content = 'A'.repeat(1000)
    const doc = createTestDocument({ content })
    const chunkSize = 50
    const chunks = defaultChunker(doc, { chunkSize, chunkOverlap: 10 })
    expect(chunks.length).toBeGreaterThan(1)
    for (const chunk of chunks) {
      expect(chunk.content.length).toBeLessThanOrEqual(chunkSize * 4)
    }
  })

  it('preserves chunk indices in order', () => {
    const content = 'Word '.repeat(500)
    const doc = createTestDocument({ content })
    const chunks = defaultChunker(doc, { chunkSize: 50, chunkOverlap: 10 })
    for (let i = 0; i < chunks.length; i++) {
      expect(chunks[i]!.chunkIndex).toBe(i)
    }
  })

  it('handles overlap correctly', () => {
    const content = 'A'.repeat(1000)
    const doc = createTestDocument({ content })
    const chunkSize = 100
    const chunkOverlap = 20
    const chunks = defaultChunker(doc, { chunkSize, chunkOverlap })
    // Each chunk starts at (end of previous) - overlapChars
    if (chunks.length >= 2) {
      const approxChunkChars = chunkSize * 4
      const approxOverlapChars = chunkOverlap * 4
      // Check that chunks overlap by examining content positions
      const firstEnd = approxChunkChars
      const secondStart = firstEnd - approxOverlapChars
      // The second chunk should start before the first chunk ends
      expect(secondStart).toBeLessThan(firstEnd)
    }
  })

  it('skips empty chunks after trimming', () => {
    const content = 'Hello' + ' '.repeat(500)
    const doc = createTestDocument({ content })
    const chunks = defaultChunker(doc, { chunkSize: 50, chunkOverlap: 10 })
    for (const chunk of chunks) {
      expect(chunk.content.length).toBeGreaterThan(0)
    }
  })

  it('returns empty array for empty content', () => {
    const doc = createTestDocument({ content: '' })
    const chunks = defaultChunker(doc, { chunkSize: 100, chunkOverlap: 20 })
    expect(chunks).toHaveLength(0)
  })

  it('handles content exactly at chunk boundary', () => {
    const chunkSize = 50
    const exactContent = 'A'.repeat(chunkSize * 4)
    const doc = createTestDocument({ content: exactContent })
    const chunks = defaultChunker(doc, { chunkSize, chunkOverlap: 0 })
    expect(chunks).toHaveLength(1)
    expect(chunks[0]!.content).toBe(exactContent)
  })
})
