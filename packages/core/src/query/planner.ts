import type { Source } from '../types/source.js'
import type { QueryOpts, QueryResponse, d8umResult } from '../types/query.js'
import type { VectorStoreAdapter } from '../types/adapter.js'
import type { EmbeddingProvider } from '../embedding/provider.js'
import { IndexedRunner } from './runners/indexed.js'
import { mergeAndRank, type NormalizedResult } from './merger.js'

export class QueryPlanner {
  constructor(
    private adapter: VectorStoreAdapter,
    private sourceIds: string[],
    private sourceEmbeddings: Map<string, EmbeddingProvider>
  ) {}

  async execute(text: string, opts: QueryOpts = {}): Promise<QueryResponse> {
    const startMs = Date.now()
    const count = opts.count ?? 10
    const tenantId = opts.tenantId

    // Filter to requested sources or use all
    const activeSourceIds = opts.sources
      ? opts.sources.filter(id => this.sourceIds.includes(id))
      : this.sourceIds

    // Group sources by embedding model
    const modelGroups = new Map<string, { embedding: EmbeddingProvider; sourceIds: string[] }>()
    const warnings: string[] = []

    for (const sourceId of activeSourceIds) {
      const emb = this.sourceEmbeddings.get(sourceId)
      if (!emb) {
        warnings.push(`Source "${sourceId}" has no embedding provider - skipped`)
        continue
      }
      const existing = modelGroups.get(emb.model)
      if (existing) {
        existing.sourceIds.push(sourceId)
      } else {
        modelGroups.set(emb.model, { embedding: emb, sourceIds: [sourceId] })
      }
    }

    // Run indexed search
    const sourceTimings: QueryResponse['sources'] = {}
    let allResults: NormalizedResult[] = []

    if (modelGroups.size > 0) {
      const runnerStart = Date.now()
      const runner = new IndexedRunner(this.adapter)
      const results = await runner.run(text, modelGroups, count, tenantId, opts.documentFilter)
      const runnerDuration = Date.now() - runnerStart

      for (const sourceId of activeSourceIds) {
        const sourceResults = results.filter(r => r.sourceId === sourceId)
        sourceTimings[sourceId] = {
          mode: 'indexed',
          resultCount: sourceResults.length,
          durationMs: runnerDuration,
          status: 'ok',
        }
      }

      allResults = results
    }

    // Merge and rank
    const weights = opts.mergeWeights
      ? Object.fromEntries(
          Object.entries(opts.mergeWeights).filter((e): e is [string, number] => e[1] != null)
        )
      : undefined
    const mergedResults = modelGroups.size > 1
      ? mergeAndRank([allResults], count, weights)
      : allResults.slice(0, count)

    // Map NormalizedResult → d8umResult
    const results: d8umResult[] = mergedResults.map(r => ({
      content: r.content,
      score: r.normalizedScore,
      scores: {
        vector: r.rawScores.vector,
        keyword: r.rawScores.keyword,
        rrf: r.normalizedScore,
      },
      source: {
        id: r.sourceId,
        documentId: r.documentId,
        title: r.title ?? '',
        url: r.url,
        updatedAt: r.updatedAt ?? new Date(),
        status: r.documentStatus,
        scope: r.documentScope,
        documentType: r.documentType,
        sourceType: r.sourceType,
        userId: r.userId,
        groupId: r.groupId,
      },
      chunk: r.chunk ?? { index: 0, total: 1, isNeighbor: false },
      metadata: r.metadata,
      tenantId: r.tenantId,
    }))

    return {
      results,
      sources: sourceTimings,
      query: {
        text,
        tenantId,
        durationMs: Date.now() - startMs,
        mergeStrategy: opts.mergeStrategy ?? 'rrf',
      },
      warnings: warnings.length > 0 ? warnings : undefined,
    }
  }
}
