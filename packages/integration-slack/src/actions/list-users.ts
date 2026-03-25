import { z } from 'zod'
import type { IntegrationActionDefinition } from '@d8um/integration-core'
import type { ApiClient } from '@d8um/core'
import { SlackUserSchema } from '../models.js'

const ListUsersInputSchema = z.object({
  limit: z.number().optional().describe('Max users to return'),
  include_bots: z.boolean().optional().describe('Include bot users'),
})

const ListUsersOutputSchema = z.object({
  users: z.array(SlackUserSchema),
  total: z.number(),
})

export const listUsersAction: IntegrationActionDefinition = {
  name: 'list-users',
  description: 'List users in the Slack workspace',
  inputSchema: ListUsersInputSchema,
  outputSchema: ListUsersOutputSchema,
  scopes: ['users:read'],

  async run(ctx: { client: ApiClient }, input: unknown): Promise<unknown> {
    // const parsed = ListUsersInputSchema.parse(input)
    // const users: SlackUser[] = []
    // let cursor: string | undefined
    //
    // do {
    //   const response = await ctx.client.get<SlackUsersListResponse>(
    //     'users.list',
    //     {
    //       limit: '200',
    //       ...(cursor ? { cursor } : {}),
    //     }
    //   )
    //
    //   for (const member of response.data.members) {
    //     if (!parsed.include_bots && member.is_bot) continue
    //     users.push(toSlackUser(member))
    //     if (parsed.limit && users.length >= parsed.limit) break
    //   }
    //
    //   cursor = response.data.response_metadata?.next_cursor
    // } while (cursor && (!parsed.limit || users.length < parsed.limit))
    //
    // return { users, total: users.length }

    throw new Error('SlackIntegration list-users action is not yet implemented')
  },
}
