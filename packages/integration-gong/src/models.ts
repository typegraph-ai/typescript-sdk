import { z } from 'zod'

// -- Calls --

export const GongCallPartySchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  emailAddress: z.string().optional(),
  affiliation: z.enum(['Internal', 'External', 'Unknown']).optional(),
})

export const GongCallSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  duration: z.number().optional(),
  direction: z.enum(['Inbound', 'Outbound', 'Conference', 'Unknown']),
  started: z.date().optional(),
  parties: z.array(GongCallPartySchema).optional(),
  mediaUrl: z.string().optional(),
})
export type GongCall = z.infer<typeof GongCallSchema>

// -- Call Transcripts --

export const GongTranscriptSpeakerSegmentSchema = z.object({
  speakerId: z.string(),
  topic: z.string().optional(),
  sentences: z.array(z.object({
    start: z.number(),
    end: z.number(),
    text: z.string(),
  })),
})

export const GongCallTranscriptSchema = z.object({
  id: z.string(),
  callId: z.string(),
  transcript: z.array(GongTranscriptSpeakerSegmentSchema),
})
export type GongCallTranscript = z.infer<typeof GongCallTranscriptSchema>

// -- Users --

export const GongUserSchema = z.object({
  id: z.string(),
  emailAddress: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  title: z.string().optional(),
})
export type GongUser = z.infer<typeof GongUserSchema>
