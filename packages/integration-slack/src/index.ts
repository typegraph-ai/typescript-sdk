// Manifest (the primary export)
export { SlackIntegration } from './manifest.js'

// Zod models (data contracts)
export {
  SlackChannelSchema,
  SlackMessageSchema,
  SlackUserSchema,
  SlackReactionSchema,
} from './models.js'
export type { SlackChannel, SlackMessage, SlackUser } from './models.js'

// Raw API types
export type {
  SlackConversationsListResponse,
  SlackConversationsHistoryResponse,
  SlackConversationsRepliesResponse,
  SlackUsersListResponse,
  SlackRawChannel,
  SlackRawMessage,
  SlackRawUser,
  SlackAuthTestResponse,
  SlackApiError,
} from './types.js'

// Mappers
export { toSlackChannel } from './mappers/to-channel.js'
export { toSlackMessage, toMessageDocument } from './mappers/to-message.js'
export { toSlackUser } from './mappers/to-user.js'

// Jobs
export { channelsJob } from './jobs/channels.js'
export { messagesJob } from './jobs/messages.js'

// Actions (plain functions — call directly with an ApiClient)
export { sendMessage, SendMessageInput, SendMessageOutput } from './actions/send-message.js'
export { listUsers, ListUsersInput, ListUsersOutput } from './actions/list-users.js'
