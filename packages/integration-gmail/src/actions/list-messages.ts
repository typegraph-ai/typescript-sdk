import { z } from 'zod'
import type { IntegrationActionDefinition } from '@d8um/integration-core'
import type { ApiClient } from '@d8um/core'
import { GmailMessageSchema } from '../models.js'

const ListMessagesInputSchema = z.object({
  query: z.string().optional().describe('Gmail search query (e.g. from:user@example.com)'),
  labelIds: z.array(z.string()).optional().describe('Label IDs to filter by'),
  maxResults: z.number().optional().describe('Max messages to return'),
})

const ListMessagesOutputSchema = z.object({
  messages: z.array(GmailMessageSchema),
  total: z.number(),
})

export const listMessagesAction: IntegrationActionDefinition = {
  name: 'list-messages',
  description: 'List messages from Gmail',
  inputSchema: ListMessagesInputSchema,
  outputSchema: ListMessagesOutputSchema,
  scopes: ['https://www.googleapis.com/auth/gmail.readonly'],

  async run(ctx: { client: ApiClient }, input: unknown): Promise<unknown> {
    // const parsed = ListMessagesInputSchema.parse(input)
    // const messages: GmailMessage[] = []
    // let pageToken: string | undefined
    //
    // do {
    //   const response = await ctx.client.get<GmailMessagesListResponse>(
    //     '/gmail/v1/users/me/messages',
    //     {
    //       ...(parsed.query ? { q: parsed.query } : {}),
    //       ...(parsed.labelIds ? { labelIds: parsed.labelIds.join(',') } : {}),
    //       maxResults: String(parsed.maxResults ?? 100),
    //       ...(pageToken ? { pageToken } : {}),
    //     }
    //   )
    //
    //   if (!response.data.messages) break
    //
    //   for (const msgRef of response.data.messages) {
    //     const msgResponse = await ctx.client.get<GmailRawMessage>(
    //       `/gmail/v1/users/me/messages/${msgRef.id}`,
    //       { format: 'full' }
    //     )
    //
    //     messages.push(toGmailMessage(msgResponse.data))
    //     if (parsed.maxResults && messages.length >= parsed.maxResults) break
    //   }
    //
    //   pageToken = response.data.nextPageToken
    // } while (pageToken && (!parsed.maxResults || messages.length < parsed.maxResults))
    //
    // return { messages, total: messages.length }

    throw new Error('GmailIntegration list-messages action is not yet implemented')
  },
}
