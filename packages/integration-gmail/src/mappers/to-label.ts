import type { GmailRawLabel } from '../types.js'
import type { GmailLabel } from '../models.js'

/**
 * Transform a raw Gmail API label into a normalized GmailLabel.
 */
export function toGmailLabel(raw: GmailRawLabel): GmailLabel {
  return {
    id: raw.id,
    name: raw.name,
    type: raw.type,
    messagesTotal: raw.messagesTotal,
    messagesUnread: raw.messagesUnread,
  }
}
