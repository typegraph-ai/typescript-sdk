import { z } from 'zod'

// ── Messages ──

export const GmailAttachmentSchema = z.object({
  filename: z.string(),
  mimeType: z.string(),
  size: z.number(),
  attachmentId: z.string().optional(),
})

export const GmailMessageBodySchema = z.object({
  text: z.string().optional(),
  html: z.string().optional(),
})

export const GmailMessageSchema = z.object({
  id: z.string(),
  threadId: z.string(),
  labelIds: z.array(z.string()).optional(),
  snippet: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  cc: z.string().optional(),
  subject: z.string().optional(),
  date: z.string().optional(),
  body: GmailMessageBodySchema.optional(),
  attachments: z.array(GmailAttachmentSchema).optional(),
})
export type GmailMessage = z.infer<typeof GmailMessageSchema>

// ── Threads ──

export const GmailThreadSchema = z.object({
  id: z.string(),
  snippet: z.string().optional(),
  messages: z.array(GmailMessageSchema).optional(),
})
export type GmailThread = z.infer<typeof GmailThreadSchema>

// ── Labels ──

export const GmailLabelSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['system', 'user']).optional(),
  messagesTotal: z.number().optional(),
  messagesUnread: z.number().optional(),
})
export type GmailLabel = z.infer<typeof GmailLabelSchema>
