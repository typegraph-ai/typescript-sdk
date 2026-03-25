import type { GongRawCallTranscript } from '../types.js'
import type { GongCallTranscript } from '../models.js'

/**
 * Transform a raw Gong API call transcript into a normalized GongCallTranscript.
 */
export function toGongTranscript(raw: GongRawCallTranscript): GongCallTranscript {
  return {
    id: `transcript-${raw.callId}`,
    callId: raw.callId,
    transcript: raw.transcript.map((segment) => ({
      speakerId: segment.speakerId,
      topic: segment.topic ?? undefined,
      sentences: segment.sentences.map((s) => ({
        start: s.start,
        end: s.end,
        text: s.text,
      })),
    })),
  }
}
