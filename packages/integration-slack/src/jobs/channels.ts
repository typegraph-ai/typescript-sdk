import type { IntegrationJobDefinition } from '@d8um/integration-core'
import type { RawDocument } from '@d8um/core'
import type { JobRunContext } from '@d8um/core'

/**
 * Fetches channels from a Slack workspace.
 *
 * High-level flow:
 * 1. Call conversations.list with cursor-based pagination
 * 2. Filter by channel type (public, private, etc.)
 * 3. Transform each channel into a RawDocument via mapper
 * 4. Yield each document
 */
export const channelsJob: IntegrationJobDefinition = {
  name: 'channels',
  description: 'Fetches channels from Slack workspace',
  entity: 'SlackChannel',
  frequency: 'daily',
  type: 'full',
  scopes: ['channels:read', 'groups:read'],
  configSchema: [
    {
      key: 'include_private',
      label: 'Include Private Channels',
      type: 'boolean',
      required: false,
    },
    {
      key: 'exclude_archived',
      label: 'Exclude Archived',
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
    //   const response = await ctx.client!.get<SlackConversationsListResponse>(
    //     'conversations.list',
    //     {
    //       types: 'public_channel,private_channel',
    //       exclude_archived: ctx.job.config.exclude_archived ? 'true' : 'false',
    //       limit: '200',
    //       ...(cursor ? { cursor } : {}),
    //     }
    //   )
    //
    //   for (const channel of response.data.channels) {
    //     yield {
    //       id: `slack-channel-${channel.id}`,
    //       content: [channel.topic?.value, channel.purpose?.value].filter(Boolean).join('\n'),
    //       title: `#${channel.name}`,
    //       updatedAt: new Date(),
    //       metadata: toSlackChannel(channel),
    //     }
    //   }
    //
    //   cursor = response.data.response_metadata?.next_cursor
    // } while (cursor)

    throw new Error('SlackIntegration channels job is not yet implemented')
  },
}
