import type { NormalizedResult } from '../merger.js'

/**
 * @deprecated Cached mode has been removed. All querying is now indexed.
 */
export class CachedRunner {
  async run(): Promise<NormalizedResult[]> {
    return []
  }
}
