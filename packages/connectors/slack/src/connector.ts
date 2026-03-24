import type { Connector, RawDocument } from '@d8um/core'

export interface SlackConnectorConfig {
  /** Slack Bot User OAuth Token (xoxb-...). */
  token: string
  /** Channel IDs to sync. If omitted, syncs all channels the bot is in. */
  channels?: string[] | undefined
  /** Only sync messages newer than this date. */
  since?: Date | undefined
  /** Include thread replies. Default: true. */
  includeThreads?: boolean | undefined
  /** Maximum messages to fetch per channel. Default: unlimited. */
  maxMessages?: number | undefined
}

export type SlackMeta = {
  channelId: string
  channelName: string
  threadTs?: string | undefined
  userId: string
  userName: string
  messageType: 'message' | 'thread_reply'
}

export class SlackConnector implements Connector<SlackMeta> {
  constructor(private config: SlackConnectorConfig) {}

  async *fetch(): AsyncIterable<RawDocument<SlackMeta>> {
    // TODO: Implement Slack Web API integration
    // 1. List channels (conversations.list) or use config.channels
    // 2. For each channel, fetch messages (conversations.history)
    // 3. For each message with replies, fetch thread (conversations.replies)
    // 4. Yield each message/thread as a RawDocument
    throw new Error('SlackConnector is not yet implemented')
  }

  async *fetchSince(since: Date): AsyncIterable<RawDocument<SlackMeta>> {
    // TODO: Implement incremental sync using oldest param
    throw new Error('SlackConnector.fetchSince is not yet implemented')
  }
}
