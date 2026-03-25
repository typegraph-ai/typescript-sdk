import { z } from 'zod'

// ── Channels ──

export const SlackChannelSchema = z.object({
  id: z.string(),
  name: z.string(),
  isPrivate: z.boolean(),
  isArchived: z.boolean(),
  topic: z.string().optional(),
  purpose: z.string().optional(),
  memberCount: z.number().optional(),
  createdAt: z.date().optional(),
})
export type SlackChannel = z.infer<typeof SlackChannelSchema>

// ── Messages ──

export const SlackReactionSchema = z.object({
  name: z.string(),
  count: z.number(),
  users: z.array(z.string()).optional(),
})

export const SlackMessageSchema = z.object({
  id: z.string(),
  channelId: z.string(),
  userId: z.string(),
  text: z.string(),
  timestamp: z.string(),
  threadTs: z.string().optional(),
  replyCount: z.number().optional(),
  reactions: z.array(SlackReactionSchema).optional(),
  attachments: z.array(z.record(z.unknown())).optional(),
  edited: z.object({
    user: z.string(),
    ts: z.string(),
  }).optional(),
})
export type SlackMessage = z.infer<typeof SlackMessageSchema>

// ── Users ──

export const SlackUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  realName: z.string().optional(),
  displayName: z.string().optional(),
  email: z.string().optional(),
  isBot: z.boolean(),
  isAdmin: z.boolean().optional(),
  isOwner: z.boolean().optional(),
  avatar: z.string().optional(),
  timezone: z.string().optional(),
  statusText: z.string().optional(),
  statusEmoji: z.string().optional(),
})
export type SlackUser = z.infer<typeof SlackUserSchema>
