import type { GmailRawThread } from '../types.js'
import type { GmailThread } from '../models.js'
import { toGmailMessage } from './to-message.js'

/**
 * Transform a raw Gmail API thread into a normalized GmailThread.
 */
export function toGmailThread(raw: GmailRawThread): GmailThread {
  return {
    id: raw.id,
    snippet: raw.snippet,
    messages: raw.messages?.map(m => toGmailMessage(m)),
  }
}
