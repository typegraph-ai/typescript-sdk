import type { SlackRawUser } from '../types.js'
import type { SlackUser } from '../models.js'

/**
 * Transform a raw Slack API user into a normalized SlackUser.
 */
export function toSlackUser(raw: SlackRawUser): SlackUser {
  return {
    id: raw.id,
    name: raw.name,
    realName: raw.real_name ?? raw.profile.real_name,
    displayName: raw.profile.display_name,
    email: raw.profile.email,
    isBot: raw.is_bot,
    isAdmin: raw.is_admin,
    isOwner: raw.is_owner,
    avatar: raw.profile.image_192 ?? raw.profile.image_72,
    timezone: raw.tz,
    statusText: raw.profile.status_text,
    statusEmoji: raw.profile.status_emoji,
  }
}
