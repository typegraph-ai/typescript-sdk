import type { d8umSource, IndexConfig } from '../../types/source.js'
import type { RawDocument } from '../../types/connector.js'
import { createMockConnector } from './mock-connector.js'

export interface MockSourceOpts {
  id?: string
  mode?: 'indexed' | 'live' | 'cached'
  documents?: RawDocument[]
  chunkSize?: number
  chunkOverlap?: number
  deduplicateBy?: string[] | ((doc: RawDocument) => string)
  stripMarkdownForEmbedding?: boolean
  preprocessForEmbedding?: (content: string) => string
  propagateMetadata?: string[]
  documentType?: string
  sourceType?: string
}

export function createMockSource(opts: MockSourceOpts = {}): d8umSource {
  const id = opts.id ?? 'test-source'
  const mode = opts.mode ?? 'indexed'
  const documents = opts.documents ?? []

  const connector = createMockConnector({ documents })

  const source: d8umSource = {
    id,
    connector,
    mode,
  }

  if (mode === 'indexed') {
    const index: IndexConfig = {
      chunkSize: opts.chunkSize ?? 100,
      chunkOverlap: opts.chunkOverlap ?? 20,
      deduplicateBy: opts.deduplicateBy ?? ['id'],
      stripMarkdownForEmbedding: opts.stripMarkdownForEmbedding,
      preprocessForEmbedding: opts.preprocessForEmbedding,
      propagateMetadata: opts.propagateMetadata,
      documentType: opts.documentType,
      sourceType: opts.sourceType,
    }
    source.index = index
  }

  return source
}
