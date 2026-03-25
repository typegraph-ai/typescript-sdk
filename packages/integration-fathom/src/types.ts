/**
 * Raw Fathom API response types.
 * These represent what the Fathom API actually returns before normalization.
 * Reference: https://developers.fathom.ai/api-reference
 */

// -- Meetings --

export interface FathomMeetingsListResponse {
  meetings: FathomRawMeeting[]
  has_more: boolean
  next_cursor?: string | undefined
}

export interface FathomRawMeeting {
  id: string
  title: string
  scheduled_at: string
  duration_seconds: number
  participants: FathomRawParticipant[]
  recording_available: boolean
  created_at: string
  updated_at: string
}

export interface FathomRawParticipant {
  name: string
  email?: string | undefined
  is_host: boolean
}

// -- Recording Summary --

export interface FathomRecordingSummaryResponse {
  recording_id: string
  summary: string
  action_items: FathomRawActionItem[]
  key_topics: string[]
  recording_url?: string | undefined
}

export interface FathomRawActionItem {
  text: string
  assignee?: string | undefined
  completed: boolean
}

// -- Recording Transcript --

export interface FathomRecordingTranscriptResponse {
  recording_id: string
  segments: FathomRawTranscriptSegment[]
  language: string
  duration_seconds: number
}

export interface FathomRawTranscriptSegment {
  speaker: string
  text: string
  start_time: number
  end_time: number
}

// -- Generic --

export interface FathomApiError {
  error: string
  message: string
  status_code: number
}
