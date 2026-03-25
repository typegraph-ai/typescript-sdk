/**
 * Raw Slack Web API response types.
 * These represent what the Slack API actually returns before normalization.
 */

// ── Conversations ──

export interface SlackConversationsListResponse {
  ok: boolean
  channels: SlackRawChannel[]
  response_metadata?: { next_cursor?: string | undefined } | undefined
}

export interface SlackRawChannel {
  id: string
  name: string
  is_channel: boolean
  is_group: boolean
  is_im: boolean
  is_mpim: boolean
  is_private: boolean
  is_archived: boolean
  is_general: boolean
  is_shared: boolean
  is_member: boolean
  topic?: { value: string; creator: string; last_set: number } | undefined
  purpose?: { value: string; creator: string; last_set: number } | undefined
  num_members?: number | undefined
  created?: number | undefined
  creator?: string | undefined
}

// ── Messages ──

export interface SlackConversationsHistoryResponse {
  ok: boolean
  messages: SlackRawMessage[]
  has_more: boolean
  response_metadata?: { next_cursor?: string | undefined } | undefined
}

export interface SlackRawMessage {
  type: string
  subtype?: string | undefined
  ts: string
  user?: string | undefined
  text: string
  thread_ts?: string | undefined
  reply_count?: number | undefined
  reply_users_count?: number | undefined
  latest_reply?: string | undefined
  reactions?: Array<{
    name: string
    count: number
    users: string[]
  }> | undefined
  attachments?: Array<Record<string, unknown>> | undefined
  edited?: {
    user: string
    ts: string
  } | undefined
  channel?: string | undefined
  bot_id?: string | undefined
}

export interface SlackConversationsRepliesResponse {
  ok: boolean
  messages: SlackRawMessage[]
  has_more: boolean
  response_metadata?: { next_cursor?: string | undefined } | undefined
}

// ── Users ──

export interface SlackUsersListResponse {
  ok: boolean
  members: SlackRawUser[]
  response_metadata?: { next_cursor?: string | undefined } | undefined
}

export interface SlackRawUser {
  id: string
  team_id: string
  name: string
  deleted: boolean
  real_name?: string | undefined
  profile: {
    display_name?: string | undefined
    real_name?: string | undefined
    email?: string | undefined
    image_24?: string | undefined
    image_32?: string | undefined
    image_48?: string | undefined
    image_72?: string | undefined
    image_192?: string | undefined
    image_512?: string | undefined
    status_text?: string | undefined
    status_emoji?: string | undefined
  }
  is_admin: boolean
  is_owner: boolean
  is_bot: boolean
  is_app_user: boolean
  tz?: string | undefined
  updated?: number | undefined
}

// ── Auth ──

export interface SlackAuthTestResponse {
  ok: boolean
  url: string
  team: string
  user: string
  team_id: string
  user_id: string
  bot_id?: string | undefined
}

// ── Generic ──

export interface SlackApiError {
  ok: false
  error: string
}
