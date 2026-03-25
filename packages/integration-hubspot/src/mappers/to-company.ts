import type { HubSpotRawCompany } from '../types.js'
import type { HubSpotCompany } from '../models.js'

/**
 * Transform a raw HubSpot API company into a normalized HubSpotCompany.
 */
export function toHubSpotCompany(raw: HubSpotRawCompany): HubSpotCompany {
  return {
    id: raw.id,
    name: raw.properties.name ?? undefined,
    domain: raw.properties.domain ?? undefined,
    industry: raw.properties.industry ?? undefined,
    type: raw.properties.type ?? undefined,
    city: raw.properties.city ?? undefined,
    state: raw.properties.state ?? undefined,
    country: raw.properties.country ?? undefined,
  }
}
