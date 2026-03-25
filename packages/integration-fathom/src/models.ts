import { z } from 'zod'

// -- Calls --

export const FathomCallSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  duration: z.number().optional(),
  participants: z.array(z.string()).optional(),
  scheduledAt: z.date().optional(),
  recordingUrl: z.string().optional(),
  summary: z.string().optional(),
})
export type FathomCall = z.infer<typeof FathomCallSchema>

// -- Transcripts --

export const FathomTranscriptSegmentSchema = z.object({
  speaker: z.string(),
  text: z.string(),
  startTime: z.number().optional(),
  endTime: z.number().optional(),
})

export const FathomTranscriptSchema = z.object({
  id: z.string(),
  callId: z.string(),
  content: z.string(),
  speakers: z.array(z.string()).optional(),
  segments: z.array(FathomTranscriptSegmentSchema).optional(),
})
export type FathomTranscript = z.infer<typeof FathomTranscriptSchema>
