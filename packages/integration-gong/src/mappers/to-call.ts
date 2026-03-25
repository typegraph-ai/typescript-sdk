import type { GongRawCall } from '../types.js'
import type { GongCall } from '../models.js'

/**
 * Transform a raw Gong API call into a normalized GongCall.
 */
export function toGongCall(raw: GongRawCall): GongCall {
  return {
    id: raw.id,
    title: raw.title,
    duration: raw.duration,
    direction: raw.direction,
    started: raw.started ? new Date(raw.started) : undefined,
    parties: raw.parties.map((p) => ({
      id: p.id,
      name: p.name ?? undefined,
      emailAddress: p.emailAddress ?? undefined,
      affiliation: p.affiliation,
    })),
    mediaUrl: raw.media ?? undefined,
  }
}
