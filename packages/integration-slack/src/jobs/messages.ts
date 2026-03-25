import type { IntegrationJobDefinition } from '@d8um/integration-core'
import type { RawDocument } from '@d8um/core'
import type { JobRunContext } from '@d8um/core'

/**
 * Fetches messages from Slack channels.
 *
 * High-level flow:
 * 1. Fetch list of channels via conversations.list (or use config filter)
 * 2. For each channel, paginate through conversations.history
 * 3. If incremental, use ctx.lastRunAt to set 'oldest' param
 * 4. For messages with thread_ts, optionally fetch conversations.replies
 * 5. Transform each message via toMessageDocument() mapper
 * 6. Yield each RawDocument
 */
export const messagesJob: IntegrationJobDefinition = {
  name: 'messages',
  description: 'Fetches messages from Slack channels',
  entity: 'SlackMessage',
  frequency: 'hourly',
  type: 'incremental',
  scopes: ['channels:history', 'groups:history'],
  configSchema: [
    {
      key: 'channel_ids',
      label: 'Channel IDs',
      type: 'text',
      required: false,
      placeholder: 'C01ABC,C02DEF (comma-separated, empty = all)',
    },
    {
      key: 'include_threads',
      label: 'Include Thread Replies',
      type: 'boolean',
      required: false,
    },
    {
      key: 'max_messages_per_channel',
      label: 'Max Messages Per Channel',
      type: 'number',
      required: false,
      placeholder: '1000',
    },
  ],

  async *run(ctx: JobRunContext): AsyncIterable<RawDocument> {
    // 1. Determine channel list
    //    - If ctx.job.config.channel_ids provided, use those
    //    - Otherwise, fetch all channels via conversations.list
    //
    // 2. For each channel:
    //    const oldest = ctx.lastRunAt
    //      ? (ctx.lastRunAt.getTime() / 1000).toString()
    //      : undefined
    //
    //    let cursor: string | undefined
    //    let messageCount = 0
    //    const maxMessages = ctx.job.config.max_messages_per_channel as number | undefined
    //
    //    do {
    //      const response = await ctx.client!.get<SlackConversationsHistoryResponse>(
    //        'conversations.history',
    //        {
    //          channel: channelId,
    //          limit: '200',
    //          ...(oldest ? { oldest } : {}),
    //          ...(cursor ? { cursor } : {}),
    //        }
    //      )
    //
    //      for (const message of response.data.messages) {
    //        if (message.subtype) continue  // skip system messages
    //
    //        yield toMessageDocument(message, channelId, channelName)
    //        messageCount++
    //
    //        // Optionally fetch thread replies
    //        if (ctx.job.config.include_threads && message.reply_count) {
    //          // Fetch conversations.replies for this thread
    //          // yield each reply as a separate document
    //        }
    //
    //        if (maxMessages && messageCount >= maxMessages) break
    //      }
    //
    //      cursor = response.data.response_metadata?.next_cursor
    //    } while (cursor && (!maxMessages || messageCount < maxMessages))

    throw new Error('SlackIntegration messages job is not yet implemented')
  },
}
