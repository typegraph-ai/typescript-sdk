import type { FathomRawMeeting, FathomRecordingSummaryResponse } from '../types.js'
import type { FathomCall } from '../models.js'

/**
 * Transform a raw Fathom API meeting (with optional summary) into a normalized FathomCall.
 */
export function toFathomCall(
  raw: FathomRawMeeting,
  summary?: FathomRecordingSummaryResponse,
): FathomCall {
  return {
    id: raw.id,
    title: raw.title,
    duration: raw.duration_seconds,
    participants: raw.participants.map((p) => p.name),
    scheduledAt: raw.scheduled_at ? new Date(raw.scheduled_at) : undefined,
    recordingUrl: summary?.recording_url ?? undefined,
    summary: summary?.summary ?? undefined,
  }
}
