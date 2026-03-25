import { z } from 'zod'
import type { IntegrationActionDefinition } from '@d8um/integration-core'
import type { ApiClient } from '@d8um/core'

const FetchCallTranscriptsInputSchema = z.object({
  callIds: z.array(z.string()).describe('List of Gong call IDs to fetch transcripts for'),
})

const FetchCallTranscriptsOutputSchema = z.object({
  requestId: z.string(),
  callTranscripts: z.array(z.object({
    callId: z.string(),
    transcript: z.array(z.object({
      speakerId: z.string(),
      topic: z.string().optional(),
      sentences: z.array(z.object({
        start: z.number(),
        end: z.number(),
        text: z.string(),
      })),
    })),
  })),
})

export const fetchCallTranscriptsAction: IntegrationActionDefinition = {
  name: 'fetch-call-transcripts',
  description: 'Fetch transcripts for specific Gong calls',
  inputSchema: FetchCallTranscriptsInputSchema,
  outputSchema: FetchCallTranscriptsOutputSchema,
  scopes: ['api:calls:read:transcript'],

  async run(ctx: { client: ApiClient }, input: unknown): Promise<unknown> {
    // const parsed = FetchCallTranscriptsInputSchema.parse(input)
    // const response = await ctx.client.post('/v2/calls/transcript', {
    //   filter: { callIds: parsed.callIds },
    // })
    // return response.data

    throw new Error('GongIntegration fetch-call-transcripts action is not yet implemented')
  },
}
