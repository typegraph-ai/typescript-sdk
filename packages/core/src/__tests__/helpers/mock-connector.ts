import type { Connector, RawDocument, Chunk, ChunkOpts } from '../../types/connector.js'
import type { d8umQuery, d8umResult } from '../../types/query.js'

export interface MockConnectorOpts {
  documents?: RawDocument[]
  fetchSince?: (since: Date) => AsyncIterable<RawDocument>
  chunk?: (doc: RawDocument, opts: ChunkOpts) => Chunk[]
  query?: (q: d8umQuery) => Promise<d8umResult[]>
  healthCheck?: () => Promise<void>
}

export function createMockConnector(opts: MockConnectorOpts = {}): Connector & { fetchCount: number } {
  const documents = opts.documents ?? []
  let fetchCount = 0

  const connector: Connector & { fetchCount: number } = {
    fetchCount: 0,
    async *fetch() {
      fetchCount++
      connector.fetchCount = fetchCount
      for (const doc of documents) {
        yield doc
      }
    },
  }

  if (opts.fetchSince) {
    connector.fetchSince = opts.fetchSince
  }
  if (opts.chunk) {
    connector.chunk = opts.chunk
  }
  if (opts.query) {
    connector.query = opts.query
  }
  if (opts.healthCheck) {
    connector.healthCheck = opts.healthCheck
  }

  return connector
}

export function createTestDocument(overrides?: Partial<RawDocument>): RawDocument {
  return {
    id: 'doc-1',
    content: 'Test document content. This is the body of the test document.',
    title: 'Test Document',
    url: 'https://example.com/doc-1',
    updatedAt: new Date('2024-01-01'),
    metadata: {},
    ...overrides,
  }
}

export function createTestDocuments(count: number, contentPrefix?: string): RawDocument[] {
  const prefix = contentPrefix ?? 'Document'
  return Array.from({ length: count }, (_, i) => ({
    id: `doc-${i + 1}`,
    content: `${prefix} ${i + 1} content. This is the body of document number ${i + 1}.`,
    title: `${prefix} ${i + 1}`,
    url: `https://example.com/doc-${i + 1}`,
    updatedAt: new Date('2024-01-01'),
    metadata: {},
  }))
}
