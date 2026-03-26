import type { ChunkOpts } from './connector.js'
import type { EmbeddingProvider } from '../embedding/provider.js'
import type { AISDKEmbeddingInput } from '../embedding/ai-sdk-adapter.js'

/**
 * A source is a named container for documents.
 * Sources have no type - they are user-defined buckets for organizing documents.
 * A source named "Marketing Docs" could receive documents from a URL scrape,
 * a domain crawl, file uploads, and a Slack sync - all at the same time.
 */
export interface Source {
  id: string
  name: string
  description?: string | undefined
  status: 'active' | 'inactive'
  tenantId?: string | undefined
}

export interface CreateSourceInput {
  name: string
  description?: string | undefined
  tenantId?: string | undefined
}

export type EmbeddingInput = EmbeddingProvider | AISDKEmbeddingInput

/**
 * Index configuration for chunking & embedding documents.
 * Used inside job configs for ingestion jobs.
 */
export interface IndexConfig extends ChunkOpts {
  deduplicateBy: string[] | ((doc: import('./connector.js').RawDocument) => string)
  propagateMetadata?: string[] | undefined
  /** If true, strip markdown syntax from chunk content before embedding. Original content is stored as-is. */
  stripMarkdownForEmbedding?: boolean | undefined
  /** Custom preprocessing function for embedding. Takes chunk content, returns text to embed. Overrides stripMarkdownForEmbedding. */
  preprocessForEmbedding?: ((content: string) => string) | undefined
  /** App-specific document type applied to all documents from this source (e.g. 'pdf', 'webpage'). */
  documentType?: string | undefined
  /** App-specific source type applied to all documents from this source (e.g. 'upload', 'web_scrape'). */
  sourceType?: string | undefined
  /** Access scope for all documents from this source. */
  scope?: import('./d8um-document.js').DocumentScope | undefined
}
