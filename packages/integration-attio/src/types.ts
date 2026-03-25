/**
 * Raw Attio REST API v2 response types.
 * These represent what the Attio API actually returns before normalization.
 */

// ── Records ──

export interface AttioListRecordsResponse {
  data: AttioRawRecord[]
  next_page_token?: string | undefined
}

export interface AttioRawRecord {
  id: {
    record_id: string
    object_id: string
  }
  created_at: string
  values: Record<string, AttioRawAttributeValue[]>
}

export interface AttioRawAttributeValue {
  attribute_type: string
  /** The actual value shape depends on attribute_type */
  original_value?: string | undefined
  value?: string | undefined
  first_name?: string | undefined
  last_name?: string | undefined
  full_name?: string | undefined
  domain?: string | undefined
  email_address?: string | undefined
  phone_number?: string | undefined
  target_record_id?: string | undefined
  currency_value?: number | undefined
}

// ── Objects ──

export interface AttioListObjectsResponse {
  data: AttioRawObject[]
}

export interface AttioRawObject {
  id: {
    object_id: string
  }
  api_slug: string
  singular_noun: string
  plural_noun: string
  created_at: string
}

// ── Tasks ──

export interface AttioListTasksResponse {
  data: AttioRawTask[]
  next_page_token?: string | undefined
}

export interface AttioRawTask {
  id: {
    task_id: string
  }
  content_plaintext: string
  deadline_at?: string | undefined
  is_completed: boolean
  created_by_actor: {
    type: string
    id: string
  }
  assignees: Array<{
    referenced_actor_type: string
    referenced_actor_id: string
  }>
  linked_records: Array<{
    target_object_id: string
    target_record_id: string
  }>
  created_at: string
}

// ── Generic ──

export interface AttioApiError {
  status_code: number
  type: string
  message: string
}
