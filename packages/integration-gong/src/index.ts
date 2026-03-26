// Manifest (the primary export)
export { GongIntegration } from './manifest.js'

// Zod models (data contracts)
export {
  GongCallSchema,
  GongCallPartySchema,
  GongCallTranscriptSchema,
  GongTranscriptSpeakerSegmentSchema,
  GongUserSchema,
} from './models.js'
export type { GongCall, GongCallTranscript, GongUser } from './models.js'

// Raw API types
export type {
  GongCallsListResponse,
  GongCallTranscriptResponse,
  GongUsersListResponse,
  GongRawCall,
  GongRawParty,
  GongRawCallTranscript,
  GongRawTranscriptSegment,
  GongRawSentence,
  GongRawUser,
  GongApiError,
} from './types.js'

// Mappers
export { toGongCall } from './mappers/to-call.js'
export { toGongTranscript } from './mappers/to-transcript.js'
export { toGongUser } from './mappers/to-user.js'

// Jobs
export { callsJob } from './jobs/calls.js'
export { transcriptsJob } from './jobs/transcripts.js'
export { usersJob } from './jobs/users.js'

// Actions (plain functions — call directly with an ApiClient)
export { fetchCallTranscripts, FetchCallTranscriptsInput, FetchCallTranscriptsOutput } from './actions/fetch-call-transcripts.js'
