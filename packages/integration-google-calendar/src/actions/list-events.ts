import { z } from 'zod'
import type { IntegrationActionDefinition } from '@d8um/integration-core'
import type { ApiClient } from '@d8um/core'
import { GoogleCalendarEventSchema } from '../models.js'

const ListEventsInputSchema = z.object({
  calendarId: z.string().optional().describe('Calendar ID (default: primary)'),
  timeMin: z.string().optional().describe('Start of time range (ISO 8601)'),
  timeMax: z.string().optional().describe('End of time range (ISO 8601)'),
  maxResults: z.number().optional().describe('Max events to return'),
  query: z.string().optional().describe('Free text search terms'),
})

const ListEventsOutputSchema = z.object({
  events: z.array(GoogleCalendarEventSchema),
  total: z.number(),
})

export const listEventsAction: IntegrationActionDefinition = {
  name: 'list-events',
  description: 'List events from a Google Calendar',
  inputSchema: ListEventsInputSchema,
  outputSchema: ListEventsOutputSchema,
  scopes: [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events.readonly',
  ],

  async run(ctx: { client: ApiClient }, input: unknown): Promise<unknown> {
    // const parsed = ListEventsInputSchema.parse(input)
    // const calendarId = parsed.calendarId ?? 'primary'
    // const events: GoogleCalendarEvent[] = []
    // let pageToken: string | undefined
    //
    // do {
    //   const response = await ctx.client.get<GoogleCalendarEventsListResponse>(
    //     `/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    //     {
    //       maxResults: String(parsed.maxResults ?? 250),
    //       singleEvents: 'true',
    //       orderBy: 'startTime',
    //       ...(parsed.timeMin ? { timeMin: parsed.timeMin } : {}),
    //       ...(parsed.timeMax ? { timeMax: parsed.timeMax } : {}),
    //       ...(parsed.query ? { q: parsed.query } : {}),
    //       ...(pageToken ? { pageToken } : {}),
    //     }
    //   )
    //
    //   for (const event of response.data.items) {
    //     if (event.status === 'cancelled') continue
    //     events.push(toGoogleCalendarEvent(event))
    //     if (parsed.maxResults && events.length >= parsed.maxResults) break
    //   }
    //
    //   pageToken = response.data.nextPageToken
    // } while (pageToken && (!parsed.maxResults || events.length < parsed.maxResults))
    //
    // return { events, total: events.length }

    throw new Error('GoogleCalendarIntegration list-events action is not yet implemented')
  },
}
