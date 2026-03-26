// Manifest (the primary export)
export { GoogleCalendarIntegration } from './manifest.js'

// Zod models (data contracts)
export {
  GoogleCalendarSchema,
  GoogleCalendarEventSchema,
  GoogleCalendarDateTimeSchema,
  GoogleCalendarAttendeeSchema,
} from './models.js'
export type { GoogleCalendar, GoogleCalendarEvent } from './models.js'

// Raw API types
export type {
  GoogleCalendarListResponse,
  GoogleCalendarEventsListResponse,
  GoogleRawCalendar,
  GoogleRawCalendarEvent,
  GoogleCalendarApiError,
} from './types.js'

// Mappers
export { toGoogleCalendar } from './mappers/to-calendar.js'
export { toGoogleCalendarEvent, toEventDocument } from './mappers/to-event.js'

// Jobs
export { eventsJob } from './jobs/events.js'

// Actions (plain functions — call directly with an ApiClient)
export { listEvents, ListEventsInput, ListEventsOutput } from './actions/list-events.js'
