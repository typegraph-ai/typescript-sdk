import type { FathomRecordingTranscriptResponse } from '../types.js'
import type { FathomTranscript } from '../models.js'

/**
 * Transform a raw Fathom API transcript response into a normalized FathomTranscript.
 */
export function toFathomTranscript(
  callId: string,
  raw: FathomRecordingTranscriptResponse,
): FathomTranscript {
  const speakers = [...new Set(raw.segments.map((s) => s.speaker))]
  const content = raw.segments
    .map((s) => `${s.speaker}: ${s.text}`)
    .join('\n')

  return {
    id: raw.recording_id,
    callId,
    content,
    speakers,
    segments: raw.segments.map((s) => ({
      speaker: s.speaker,
      text: s.text,
      startTime: s.start_time,
      endTime: s.end_time,
    })),
  }
}
