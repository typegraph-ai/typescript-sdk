import type { AttioRawTask } from '../types.js'
import type { AttioTask } from '../models.js'

/**
 * Transform a raw Attio API task into a normalized AttioTask.
 */
export function toAttioTask(raw: AttioRawTask): AttioTask {
  // Derive status from the is_completed flag
  const status = raw.is_completed ? 'completed' : 'open'

  // Extract first assignee ID (the consuming app resolves actor IDs to names)
  const assignee = raw.assignees.length > 0
    ? raw.assignees[0]!.referenced_actor_id
    : undefined

  return {
    id: raw.id.task_id,
    title: raw.content_plaintext,
    description: undefined,
    status,
    assignee,
    dueDate: raw.deadline_at ? new Date(raw.deadline_at) : undefined,
    priority: undefined,
    createdAt: raw.created_at ? new Date(raw.created_at) : undefined,
  }
}
