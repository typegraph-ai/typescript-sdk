/**
 * Raw Google Calendar API v3 response types.
 * These represent what the Google Calendar API actually returns before normalization.
 */

// ── Calendar List ──

export interface GoogleCalendarListResponse {
  kind: 'calendar#calendarList'
  etag: string
  nextPageToken?: string | undefined
  nextSyncToken?: string | undefined
  items: GoogleRawCalendar[]
}

export interface GoogleRawCalendar {
  kind: 'calendar#calendarListEntry'
  etag: string
  id: string
  summary: string
  description?: string | undefined
  location?: string | undefined
  timeZone?: string | undefined
  summaryOverride?: string | undefined
  colorId?: string | undefined
  backgroundColor?: string | undefined
  foregroundColor?: string | undefined
  hidden?: boolean | undefined
  selected?: boolean | undefined
  accessRole: 'freeBusyReader' | 'reader' | 'writer' | 'owner'
  defaultReminders?: Array<{
    method: string
    minutes: number
  }> | undefined
  primary?: boolean | undefined
  deleted?: boolean | undefined
}

// ── Events ──

export interface GoogleCalendarEventsListResponse {
  kind: 'calendar#events'
  etag: string
  summary: string
  description?: string | undefined
  updated: string
  timeZone: string
  accessRole: string
  nextPageToken?: string | undefined
  nextSyncToken?: string | undefined
  items: GoogleRawCalendarEvent[]
}

export interface GoogleRawCalendarEvent {
  kind: 'calendar#event'
  etag: string
  id: string
  status?: 'confirmed' | 'tentative' | 'cancelled' | undefined
  htmlLink?: string | undefined
  created?: string | undefined
  updated?: string | undefined
  summary?: string | undefined
  description?: string | undefined
  location?: string | undefined
  creator?: {
    id?: string | undefined
    email: string
    displayName?: string | undefined
    self?: boolean | undefined
  } | undefined
  organizer?: {
    id?: string | undefined
    email: string
    displayName?: string | undefined
    self?: boolean | undefined
  } | undefined
  start: {
    dateTime?: string | undefined
    date?: string | undefined
    timeZone?: string | undefined
  }
  end: {
    dateTime?: string | undefined
    date?: string | undefined
    timeZone?: string | undefined
  }
  endTimeUnspecified?: boolean | undefined
  recurrence?: string[] | undefined
  recurringEventId?: string | undefined
  originalStartTime?: {
    dateTime?: string | undefined
    date?: string | undefined
    timeZone?: string | undefined
  } | undefined
  transparency?: 'opaque' | 'transparent' | undefined
  visibility?: 'default' | 'public' | 'private' | 'confidential' | undefined
  iCalUID?: string | undefined
  sequence?: number | undefined
  attendees?: Array<{
    id?: string | undefined
    email: string
    displayName?: string | undefined
    organizer?: boolean | undefined
    self?: boolean | undefined
    resource?: boolean | undefined
    optional?: boolean | undefined
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted' | undefined
    comment?: string | undefined
    additionalGuests?: number | undefined
  }> | undefined
  hangoutLink?: string | undefined
  conferenceData?: {
    entryPoints?: Array<{
      entryPointType: string
      uri: string
      label?: string | undefined
    }> | undefined
    conferenceSolution?: {
      key: { type: string }
      name: string
      iconUri?: string | undefined
    } | undefined
    conferenceId?: string | undefined
  } | undefined
  reminders?: {
    useDefault: boolean
    overrides?: Array<{
      method: string
      minutes: number
    }> | undefined
  } | undefined
}

// ── Generic ──

export interface GoogleCalendarApiError {
  error: {
    code: number
    message: string
    status: string
    errors: Array<{
      message: string
      domain: string
      reason: string
    }>
  }
}
