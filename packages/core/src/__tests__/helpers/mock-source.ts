import type { Source, IndexConfig } from '../../types/source.js'
import type { RawDocument, Connector } from '../../types/connector.js'
import { createMockConnector } from './mock-connector.js'

export interface MockSourceOpts {
  id?: string
  name?: string
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

export interface MockSourceResult {
  source: Source
  connector: Connector
  indexConfig: IndexConfig
}

export function createMockSource(opts: MockSourceOpts = {}): MockSourceResult {
  const id = opts.id ?? 'test-source'
  const documents = opts.documents ?? []

  const connector = createMockConnector({ documents })

  const source: Source = {
    id,
    name: opts.name ?? 'Test Source',
    status: 'active',
  }

  const indexConfig: IndexConfig = {
    chunkSize: opts.chunkSize ?? 100,
    chunkOverlap: opts.chunkOverlap ?? 20,
    deduplicateBy: opts.deduplicateBy ?? ['id'],
    stripMarkdownForEmbedding: opts.stripMarkdownForEmbedding,
    preprocessForEmbedding: opts.preprocessForEmbedding,
    propagateMetadata: opts.propagateMetadata,
    documentType: opts.documentType,
    sourceType: opts.sourceType,
  }

  return { source, connector, indexConfig }
}
