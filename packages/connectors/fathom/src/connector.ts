import type { Connector, RawDocument } from '@d8um/core'

export interface FathomConnectorConfig {
  /** Fathom API key. */
  apiKey: string
  /** Only sync calls after this date. */
  since?: Date | undefined
  /** Maximum calls to fetch. Default: unlimited. */
  maxCalls?: number | undefined
  /** Include AI-generated summaries alongside transcripts. Default: true. */
  includeSummaries?: boolean | undefined
}

export type FathomMeta = {
  callId: string
  duration: number
  participants: string[]
  scheduledAt?: Date | undefined
  platform?: string | undefined
  hasSummary: boolean
}

export class FathomConnector implements Connector<FathomMeta> {
  constructor(private config: FathomConnectorConfig) {}

  async *fetch(): AsyncIterable<RawDocument<FathomMeta>> {
    // TODO: Implement Fathom API integration
    // 1. List calls (GET /api/calls)
    // 2. For each call, fetch transcript (GET /api/calls/:id/transcript)
    // 3. Optionally fetch AI summary (GET /api/calls/:id/summary)
    // 4. Yield each call as a RawDocument (transcript as content)
    throw new Error('FathomConnector is not yet implemented')
  }

  async *fetchSince(since: Date): AsyncIterable<RawDocument<FathomMeta>> {
    // TODO: Implement incremental sync using date filter
    throw new Error('FathomConnector.fetchSince is not yet implemented')
  }
}
