import { z } from 'zod'
import type { IntegrationActionDefinition } from '@d8um/integration-core'
import type { ApiClient } from '@d8um/core'

const ListCallsInputSchema = z.object({
  limit: z.number().optional().describe('Maximum number of calls to return'),
  cursor: z.string().optional().describe('Pagination cursor from previous response'),
})

const ListCallsOutputSchema = z.object({
  meetings: z.array(z.object({
    id: z.string(),
    title: z.string(),
    scheduled_at: z.string(),
    duration_seconds: z.number(),
    recording_available: z.boolean(),
  })),
  has_more: z.boolean(),
  next_cursor: z.string().optional(),
})

export const listCallsAction: IntegrationActionDefinition = {
  name: 'list-calls',
  description: 'List recent call recordings from Fathom',
  inputSchema: ListCallsInputSchema,
  outputSchema: ListCallsOutputSchema,
  scopes: ['public_api'],

  async run(ctx: { client: ApiClient }, input: unknown): Promise<unknown> {
    // const parsed = ListCallsInputSchema.parse(input)
    // const response = await ctx.client.get('/meetings', {
    //   limit: String(parsed.limit ?? 20),
    //   ...(parsed.cursor ? { cursor: parsed.cursor } : {}),
    // })
    // return response.data

    throw new Error('FathomIntegration list-calls action is not yet implemented')
  },
}
