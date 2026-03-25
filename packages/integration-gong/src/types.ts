/**
 * Raw Gong API v2 response types.
 * These represent what the Gong API actually returns before normalization.
 * Reference: https://gong.app.gong.io/settings/api/documentation
 */

// -- Calls --

export interface GongCallsListResponse {
  requestId: string
  records: {
    totalRecords: number
    currentPageSize: number
    currentPageNumber: number
    cursor?: string | undefined
  }
  calls: GongRawCall[]
}

export interface GongRawCall {
  id: string
  url: string
  title: string
  scheduled: string
  started: string
  duration: number
  direction: 'Inbound' | 'Outbound' | 'Conference' | 'Unknown'
  scope: string
  media?: string | undefined
  language?: string | undefined
  workspaceId?: string | undefined
  sdrDisposition?: string | undefined
  clientUniqueId?: string | undefined
  customData?: string | undefined
  purpose?: string | undefined
  meetingUrl?: string | undefined
  isPrivate: boolean
  calendarEventId?: string | undefined
  parties: GongRawParty[]
}

export interface GongRawParty {
  id: string
  emailAddress?: string | undefined
  name?: string | undefined
  title?: string | undefined
  userId?: string | undefined
  speakerId?: string | undefined
  context?: string[] | undefined
  affiliation: 'Internal' | 'External' | 'Unknown'
  phoneNumber?: string | undefined
  methods?: string[] | undefined
}

// -- Transcripts --

export interface GongCallTranscriptResponse {
  requestId: string
  records: {
    totalRecords: number
    currentPageSize: number
    currentPageNumber: number
    cursor?: string | undefined
  }
  callTranscripts: GongRawCallTranscript[]
}

export interface GongRawCallTranscript {
  callId: string
  transcript: GongRawTranscriptSegment[]
}

export interface GongRawTranscriptSegment {
  speakerId: string
  topic?: string | undefined
  sentences: GongRawSentence[]
}

export interface GongRawSentence {
  start: number
  end: number
  text: string
}

// -- Users --

export interface GongUsersListResponse {
  requestId: string
  records: {
    totalRecords: number
    currentPageSize: number
    currentPageNumber: number
    cursor?: string | undefined
  }
  users: GongRawUser[]
}

export interface GongRawUser {
  id: string
  emailAddress: string
  created: string
  active: boolean
  emailAliases?: string[] | undefined
  trustedEmailAddress?: string | undefined
  firstName?: string | undefined
  lastName?: string | undefined
  title?: string | undefined
  phoneNumber?: string | undefined
  extension?: string | undefined
  personalMeetingUrls?: string[] | undefined
  settings?: {
    webConferencesRecorded?: boolean | undefined
    preventWebConferenceRecording?: boolean | undefined
    telephonyCallsImported?: boolean | undefined
    crmCallsImported?: boolean | undefined
    thirdPartyCallsImported?: boolean | undefined
    emailsImported?: boolean | undefined
  } | undefined
  managerId?: string | undefined
  meetingConsentPageUrl?: string | undefined
  spokenLanguages?: Array<{
    language: string
    primary: boolean
  }> | undefined
}

// -- Generic --

export interface GongApiError {
  requestId: string
  errors: Array<{
    code: string
    message: string
  }>
}
