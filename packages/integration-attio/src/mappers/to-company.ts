import type { AttioRawRecord } from '../types.js'
import type { AttioCompany } from '../models.js'

/**
 * Transform a raw Attio API record (companies object) into a normalized AttioCompany.
 *
 * Attio stores attribute values as arrays keyed by attribute slug.
 */
export function toAttioCompany(raw: AttioRawRecord): AttioCompany {
  const values = raw.values

  // Extract company name from the 'name' attribute
  const nameValues = values['name'] ?? []
  const name = nameValues[0]?.value ?? ''

  // Extract domains from the 'domains' attribute
  const domainValues = values['domains'] ?? []
  const domains = domainValues
    .map(v => v.domain)
    .filter((d): d is string => !!d)

  // Extract industry from the 'industry' attribute
  const industryValues = values['industry'] ?? []
  const industry = industryValues[0]?.value ?? undefined

  // Extract team size from the 'team_size' or 'employee_count' attribute
  const sizeValues = values['team_size'] ?? values['employee_count'] ?? []
  const size = sizeValues[0]?.value ?? undefined

  return {
    id: raw.id.record_id,
    name,
    domains,
    industry,
    size,
    createdAt: raw.created_at ? new Date(raw.created_at) : undefined,
  }
}
