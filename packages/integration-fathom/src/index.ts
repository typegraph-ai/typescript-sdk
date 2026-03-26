// Manifest (the primary export)
export { FathomIntegration } from './manifest.js'

// Zod models (data contracts)
export {
  FathomCallSchema,
  FathomTranscriptSchema,
  FathomTranscriptSegmentSchema,
} from './models.js'
export type { FathomCall, FathomTranscript } from './models.js'

// Raw API types
export type {
  FathomMeetingsListResponse,
  FathomRecordingSummaryResponse,
  FathomRecordingTranscriptResponse,
  FathomRawMeeting,
  FathomRawParticipant,
  FathomRawActionItem,
  FathomRawTranscriptSegment,
  FathomApiError,
} from './types.js'

// Mappers
export { toFathomCall } from './mappers/to-call.js'
export { toFathomTranscript } from './mappers/to-transcript.js'

// Jobs
export { callsJob } from './jobs/calls.js'

// Actions (plain functions — call directly with an ApiClient)
export { listCalls, ListCallsInput, ListCallsOutput } from './actions/list-calls.js'
