import type { HubSpotRawContact } from '../types.js'
import type { HubSpotContact } from '../models.js'

/**
 * Transform a raw HubSpot API contact into a normalized HubSpotContact.
 */
export function toHubSpotContact(raw: HubSpotRawContact): HubSpotContact {
  return {
    id: raw.id,
    email: raw.properties.email ?? undefined,
    firstName: raw.properties.firstname ?? undefined,
    lastName: raw.properties.lastname ?? undefined,
    phone: raw.properties.phone ?? undefined,
    company: raw.properties.company ?? undefined,
    lifecycleStage: raw.properties.lifecyclestage ?? undefined,
    createDate: raw.properties.createdate
      ? new Date(raw.properties.createdate)
      : undefined,
  }
}
