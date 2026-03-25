/**
 * Raw Gmail API v1 response types.
 * These represent what the Gmail API actually returns before normalization.
 */

// ── Messages List ──

export interface GmailMessagesListResponse {
  messages?: GmailRawMessageRef[] | undefined
  nextPageToken?: string | undefined
  resultSizeEstimate?: number | undefined
}

export interface GmailRawMessageRef {
  id: string
  threadId: string
}

// ── Message Get ──

export interface GmailRawMessage {
  id: string
  threadId: string
  labelIds?: string[] | undefined
  snippet?: string | undefined
  historyId?: string | undefined
  internalDate?: string | undefined
  sizeEstimate?: number | undefined
  raw?: string | undefined
  payload?: GmailRawMessagePart | undefined
}

export interface GmailRawMessagePart {
  partId?: string | undefined
  mimeType: string
  filename?: string | undefined
  headers?: Array<{
    name: string
    value: string
  }> | undefined
  body?: {
    attachmentId?: string | undefined
    size: number
    data?: string | undefined
  } | undefined
  parts?: GmailRawMessagePart[] | undefined
}

// ── Labels ──

export interface GmailLabelsListResponse {
  labels: GmailRawLabel[]
}

export interface GmailRawLabel {
  id: string
  name: string
  messageListVisibility?: 'show' | 'hide' | undefined
  labelListVisibility?: 'labelShow' | 'labelShowIfUnread' | 'labelHide' | undefined
  type: 'system' | 'user'
  messagesTotal?: number | undefined
  messagesUnread?: number | undefined
  threadsTotal?: number | undefined
  threadsUnread?: number | undefined
  color?: {
    textColor?: string | undefined
    backgroundColor?: string | undefined
  } | undefined
}

// ── Threads ──

export interface GmailRawThread {
  id: string
  historyId?: string | undefined
  snippet?: string | undefined
  messages?: GmailRawMessage[] | undefined
}

// ── Generic ──

export interface GmailApiError {
  error: {
    code: number
    message: string
    status: string
    errors: Array<{
      message: string
      domain: string
      reason: string
    }>
  }
}
