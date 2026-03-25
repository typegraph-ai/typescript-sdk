import { z } from 'zod'

// ── Calendars ──

export const GoogleCalendarSchema = z.object({
  id: z.string(),
  summary: z.string(),
  description: z.string().optional(),
  timeZone: z.string().optional(),
  accessRole: z.enum(['freeBusyReader', 'reader', 'writer', 'owner']),
})
export type GoogleCalendar = z.infer<typeof GoogleCalendarSchema>

// ── Events ──

export const GoogleCalendarDateTimeSchema = z.object({
  dateTime: z.string().optional(),
  date: z.string().optional(),
  timeZone: z.string().optional(),
})

export const GoogleCalendarAttendeeSchema = z.object({
  email: z.string(),
  displayName: z.string().optional(),
  responseStatus: z.enum(['needsAction', 'declined', 'tentative', 'accepted']).optional(),
  self: z.boolean().optional(),
  organizer: z.boolean().optional(),
})

export const GoogleCalendarEventSchema = z.object({
  id: z.string(),
  summary: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  start: GoogleCalendarDateTimeSchema,
  end: GoogleCalendarDateTimeSchema,
  status: z.enum(['confirmed', 'tentative', 'cancelled']).optional(),
  creator: z.object({
    email: z.string(),
    displayName: z.string().optional(),
  }).optional(),
  organizer: z.object({
    email: z.string(),
    displayName: z.string().optional(),
  }).optional(),
  attendees: z.array(GoogleCalendarAttendeeSchema).optional(),
  htmlLink: z.string().optional(),
  recurringEventId: z.string().optional(),
  hangoutLink: z.string().optional(),
})
export type GoogleCalendarEvent = z.infer<typeof GoogleCalendarEventSchema>
