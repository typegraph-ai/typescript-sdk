import type { KnowledgeGraphBridge } from '../../types/graph-bridge.js'
import type { typegraphIdentity } from '../../types/identity.js'
import type { QueryGraphOptions } from '../../types/query.js'
import type { NormalizedResult } from '../merger.js'

export class GraphRunner {
  constructor(private graph: KnowledgeGraphBridge) {}

  /**
   * Graph-augmented retrieval via Personalized PageRank.
   *
   * 1. Build fact, entity, and passage seeds
   * 2. Traverse a heterogeneous entity<->passage graph
   * 3. Read out ranked passage nodes directly
   * 4. Return passage-backed results for merging with other runners
   */
  async run(
    text: string,
    identity: typegraphIdentity,
    count: number,
    bucketIds?: string[],
    options?: QueryGraphOptions,
  ): Promise<NormalizedResult[]> {
    if (!this.graph.searchGraphPassages) {
      throw new Error('Knowledge graph bridge must implement searchGraphPassages for graph queries.')
    }

    const graphResult = await this.graph.searchGraphPassages(text, identity, {
      ...options,
      count,
      bucketIds,
    })
    return graphResult.results.map(result => ({
      content: result.content,
      bucketId: result.bucketId,
      documentId: result.documentId,
      rawScores: { graph: result.score },
      normalizedScore: result.score,
      mode: 'graph' as const,
      metadata: {
        ...(result.metadata ?? {}),
        _graphTrace: graphResult.trace,
        passageId: result.passageId,
      },
      chunk: { index: result.chunkIndex, total: result.totalChunks ?? 1, isNeighbor: false },
      tenantId: result.tenantId ?? identity.tenantId,
      groupId: result.groupId,
      userId: result.userId,
      agentId: result.agentId,
      conversationId: result.conversationId,
    }))
  }
}
