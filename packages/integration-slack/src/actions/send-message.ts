import { z } from 'zod'
import type { IntegrationActionDefinition } from '@d8um/integration-core'
import type { ApiClient } from '@d8um/core'

const SendMessageInputSchema = z.object({
  channel: z.string().describe('Channel ID to send the message to'),
  text: z.string().describe('Message text'),
  thread_ts: z.string().optional().describe('Thread timestamp to reply to'),
})

const SendMessageOutputSchema = z.object({
  ok: z.boolean(),
  channel: z.string(),
  ts: z.string(),
  message: z.object({
    text: z.string(),
    ts: z.string(),
  }),
})

export const sendMessageAction: IntegrationActionDefinition = {
  name: 'send-message',
  description: 'Send a message to a Slack channel',
  inputSchema: SendMessageInputSchema,
  outputSchema: SendMessageOutputSchema,
  scopes: ['chat:write'],

  async run(ctx: { client: ApiClient }, input: unknown): Promise<unknown> {
    // const parsed = SendMessageInputSchema.parse(input)
    // const response = await ctx.client.post('chat.postMessage', {
    //   channel: parsed.channel,
    //   text: parsed.text,
    //   ...(parsed.thread_ts ? { thread_ts: parsed.thread_ts } : {}),
    // })
    // return response.data

    throw new Error('SlackIntegration send-message action is not yet implemented')
  },
}
