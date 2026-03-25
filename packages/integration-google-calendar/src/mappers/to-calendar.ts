import type { GoogleRawCalendar } from '../types.js'
import type { GoogleCalendar } from '../models.js'

/**
 * Transform a raw Google Calendar API calendar list entry into a normalized GoogleCalendar.
 */
export function toGoogleCalendar(raw: GoogleRawCalendar): GoogleCalendar {
  return {
    id: raw.id,
    summary: raw.summaryOverride ?? raw.summary,
    description: raw.description,
    timeZone: raw.timeZone,
    accessRole: raw.accessRole,
  }
}
