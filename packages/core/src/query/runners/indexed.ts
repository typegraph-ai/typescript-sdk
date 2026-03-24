import type { VectorStoreAdapter } from '../../types/adapter.js'
import type { EmbeddingProvider } from '../../embedding/provider.js'
import type { D8umSource } from '../../types/source.js'
import type { NormalizedResult } from '../merger.js'

export class IndexedRunner {
  constructor(
    private adapter: VectorStoreAdapter
  ) {}

  /**
   * Run indexed search across sources grouped by embedding model.
   * For each model group: embed the query once, search, collect results.
   *
   * @param text - Query text
   * @param sourcesByModel - Map of model ID → { embedding, sourceIds }
   * @param topK - Max results per model group
   * @param tenantId - Optional tenant isolation
   */
  async run(
    text: string,
    sourcesByModel: Map<string, { embedding: EmbeddingProvider; sourceIds: string[] }>,
    topK: number,
    tenantId?: string
  ): Promise<NormalizedResult[]> {
    // TODO: For each model group:
    // 1. Embed query text with the group's embedding provider
    // 2. Search the adapter with that model's embedding
    // 3. Normalize scores
    // 4. Collect all results
    throw new Error('Not implemented')
  }
}
