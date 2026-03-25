import type { IntegrationJobDefinition } from '@d8um/integration-core'
import type { RawDocument } from '@d8um/core'
import type { JobRunContext } from '@d8um/core'

/**
 * Fetches users from a Gong workspace.
 *
 * High-level flow:
 * 1. Call GET /v2/users with cursor-based pagination
 * 2. Transform each user into a RawDocument via toGongUser mapper
 * 3. Yield each document
 * 4. Follow records.cursor for next page until no more pages
 */
export const usersJob: IntegrationJobDefinition = {
  name: 'users',
  description: 'Fetches users from Gong workspace',
  entity: 'GongUser',
  frequency: 'daily',
  type: 'full',
  scopes: ['api:users:read'],
  configSchema: [
    {
      key: 'include_inactive',
      label: 'Include Inactive Users',
      type: 'boolean',
      required: false,
    },
  ],

  async *run(ctx: JobRunContext): AsyncIterable<RawDocument> {
    // 1. Initialize cursor for pagination
    // let cursor: string | undefined
    //
    // 2. Loop through pages
    // do {
    //   const response = await ctx.client!.get<GongUsersListResponse>(
    //     '/v2/users',
    //     {
    //       ...(cursor ? { cursor } : {}),
    //     }
    //   )
    //
    //   for (const user of response.data.users) {
    //     const mapped = toGongUser(user)
    //     yield {
    //       id: `gong-user-${user.id}`,
    //       content: [mapped.firstName, mapped.lastName, mapped.emailAddress, mapped.title].filter(Boolean).join(' '),
    //       title: [mapped.firstName, mapped.lastName].filter(Boolean).join(' ') || mapped.emailAddress || user.id,
    //       updatedAt: new Date(user.created),
    //       metadata: mapped,
    //     }
    //   }
    //
    //   cursor = response.data.records.cursor
    // } while (cursor)

    throw new Error('GongIntegration users job is not yet implemented')
  },
}
