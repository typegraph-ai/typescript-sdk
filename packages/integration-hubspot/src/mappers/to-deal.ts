import type { HubSpotRawDeal } from '../types.js'
import type { HubSpotDeal } from '../models.js'

/**
 * Transform a raw HubSpot API deal into a normalized HubSpotDeal.
 */
export function toHubSpotDeal(raw: HubSpotRawDeal): HubSpotDeal {
  return {
    id: raw.id,
    dealName: raw.properties.dealname ?? undefined,
    amount: raw.properties.amount
      ? parseFloat(raw.properties.amount)
      : undefined,
    stage: raw.properties.dealstage ?? undefined,
    pipeline: raw.properties.pipeline ?? undefined,
    closeDate: raw.properties.closedate
      ? new Date(raw.properties.closedate)
      : undefined,
    ownerName: undefined, // Owner name requires a separate lookup by hubspot_owner_id
  }
}
