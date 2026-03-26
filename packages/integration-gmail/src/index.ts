// Manifest (the primary export)
export { GmailIntegration } from './manifest.js'

// Zod models (data contracts)
export {
  GmailMessageSchema,
  GmailMessageBodySchema,
  GmailAttachmentSchema,
  GmailThreadSchema,
  GmailLabelSchema,
} from './models.js'
export type { GmailMessage, GmailThread, GmailLabel } from './models.js'

// Raw API types
export type {
  GmailMessagesListResponse,
  GmailRawMessageRef,
  GmailRawMessage,
  GmailRawMessagePart,
  GmailLabelsListResponse,
  GmailRawLabel,
  GmailRawThread,
  GmailApiError,
} from './types.js'

// Mappers
export { toGmailMessage, toMessageDocument } from './mappers/to-message.js'
export { toGmailThread } from './mappers/to-thread.js'
export { toGmailLabel } from './mappers/to-label.js'

// Jobs
export { messagesJob } from './jobs/messages.js'

// Actions (plain functions - call directly with an ApiClient)
export { listMessages, ListMessagesInput, ListMessagesOutput } from './actions/list-messages.js'
