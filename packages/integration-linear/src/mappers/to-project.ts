import type { LinearRawProject } from '../types.js'
import type { LinearProject } from '../models.js'

/**
 * Transform a raw Linear GraphQL project into a normalized LinearProject.
 */
export function toLinearProject(raw: LinearRawProject): LinearProject {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    state: raw.state,
    progress: raw.progress,
    startDate: raw.startDate ? new Date(raw.startDate) : undefined,
    targetDate: raw.targetDate ? new Date(raw.targetDate) : undefined,
    lead: raw.lead ? { name: raw.lead.name } : undefined,
    url: raw.url,
  }
}
