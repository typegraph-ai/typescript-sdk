import type { NormalizedResult } from '../merger.js'

/**
 * @deprecated Live mode has been removed. All querying is now indexed.
 */
export class LiveRunner {
  async run(): Promise<NormalizedResult[]> {
    return []
  }
}
