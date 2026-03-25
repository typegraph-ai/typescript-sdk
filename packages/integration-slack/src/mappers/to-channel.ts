import type { SlackRawChannel } from '../types.js'
import type { SlackChannel } from '../models.js'

/**
 * Transform a raw Slack API channel into a normalized SlackChannel.
 */
export function toSlackChannel(raw: SlackRawChannel): SlackChannel {
  return {
    id: raw.id,
    name: raw.name,
    isPrivate: raw.is_private,
    isArchived: raw.is_archived,
    topic: raw.topic?.value,
    purpose: raw.purpose?.value,
    memberCount: raw.num_members,
    createdAt: raw.created ? new Date(raw.created * 1000) : undefined,
  }
}
