import { describe, expect, it, vi } from 'vitest'
import { GraphRunner } from '../query/runners/graph-runner.js'
import type { KnowledgeGraphBridge } from '../types/graph-bridge.js'

describe('GraphRunner', () => {
  it('maps passage graph results into normalized graph results', async () => {
    const searchGraphPassages = vi.fn().mockResolvedValue({
      results: [{
        passageId: 'passage-1',
        content: 'Adarsh Tadimari is debugging Plotline SDK initialization.',
        bucketId: 'bucket-1',
        documentId: 'doc-1',
        chunkIndex: 2,
        totalChunks: 5,
        score: 0.42,
        metadata: { source: 'test' },
        tenantId: 'tenant-1',
      }],
      trace: {
        entitySeedCount: 1,
        factSeedCount: 1,
        passageSeedCount: 1,
        graphNodeCount: 3,
        graphEdgeCount: 2,
        pprNonzeroCount: 3,
        candidatesBeforeMerge: 1,
        candidatesAfterMerge: 1,
        topGraphScores: [0.42],
        selectedFactIds: ['fact-1'],
        selectedEntityIds: ['ent-1'],
        selectedPassageIds: ['passage-1'],
      },
    })

    const runner = new GraphRunner({ searchGraphPassages } satisfies KnowledgeGraphBridge)
    const results = await runner.run(
      'Adarsh Plotline SDK',
      { tenantId: 'tenant-1' },
      3,
      ['bucket-1'],
      { restartProbability: 0.5 }
    )

    expect(searchGraphPassages).toHaveBeenCalledWith(
      'Adarsh Plotline SDK',
      { tenantId: 'tenant-1' },
      { restartProbability: 0.5, count: 3, bucketIds: ['bucket-1'] }
    )
    expect(results).toEqual([
      expect.objectContaining({
        content: 'Adarsh Tadimari is debugging Plotline SDK initialization.',
        bucketId: 'bucket-1',
        documentId: 'doc-1',
        rawScores: { graph: 0.42 },
        mode: 'graph',
        chunk: { index: 2, total: 5, isNeighbor: false },
        metadata: expect.objectContaining({
          source: 'test',
          passageId: 'passage-1',
          _graphTrace: expect.objectContaining({
            selectedPassageIds: ['passage-1'],
          }),
        }),
        tenantId: 'tenant-1',
      }),
    ])
  })

  it('throws when searchGraphPassages is missing', async () => {
    const runner = new GraphRunner({} satisfies KnowledgeGraphBridge)

    await expect(
      runner.run('Adarsh', { tenantId: 'tenant-1' }, 5)
    ).rejects.toThrow('Knowledge graph bridge must implement searchGraphPassages for graph queries.')
  })
})
