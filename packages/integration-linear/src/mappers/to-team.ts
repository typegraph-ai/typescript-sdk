import type { LinearRawTeam } from '../types.js'
import type { LinearTeam } from '../models.js'

/**
 * Transform a raw Linear GraphQL team into a normalized LinearTeam.
 */
export function toLinearTeam(raw: LinearRawTeam): LinearTeam {
  return {
    id: raw.id,
    name: raw.name,
    key: raw.key,
    description: raw.description,
    members: raw.members.nodes.map(m => ({
      id: m.id,
      name: m.name,
      email: m.email,
    })),
  }
}
