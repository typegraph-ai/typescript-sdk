import type { D8umSource } from '../types/source.js'
import type { QueryOpts, QueryResponse } from '../types/query.js'
import type { VectorStoreAdapter } from '../types/adapter.js'
import type { EmbeddingProvider } from '../embedding/provider.js'

export class QueryPlanner {
  constructor(
    private adapter: VectorStoreAdapter,
    private sources: Map<string, D8umSource>,
    private sourceEmbeddings: Map<string, EmbeddingProvider>
  ) {}

  async execute(text: string, opts: QueryOpts = {}): Promise<QueryResponse> {
    // TODO: implement model-aware fan-out
    // 1. Filter sources by opts.sources (or use all)
    // 2. Group sources by embedding model:
    //    Map<modelId, { embedding: EmbeddingProvider, sourceIds: string[] }>
    // 3. For indexed sources per model group:
    //    - Embed query once per distinct model
    //    - Search adapter with model + embedding
    // 4. For live sources: call connector.query()
    // 5. For cached sources: check TTL, fetch if needed, search
    // 6. Promise.allSettled with per-mode timeouts
    // 7. Merge all results via ScoreMerger
    // 8. Build QueryResponse
    throw new Error('Not implemented')
  }
}
