import type { SalesforceRawOpportunity } from '../types.js'
import type { SalesforceOpportunity } from '../models.js'

/**
 * Transform a raw Salesforce SOQL Opportunity record into a normalized SalesforceOpportunity.
 */
export function toSalesforceOpportunity(raw: SalesforceRawOpportunity): SalesforceOpportunity {
  return {
    id: raw.Id,
    name: raw.Name,
    amount: raw.Amount ?? undefined,
    stageName: raw.StageName,
    probability: raw.Probability ?? undefined,
    closeDate: raw.CloseDate ? new Date(raw.CloseDate) : undefined,
    type: raw.Type ?? undefined,
    accountId: raw.AccountId ?? undefined,
    ownerId: raw.OwnerId ?? undefined,
    createdDate: new Date(raw.CreatedDate),
    lastModifiedDate: new Date(raw.LastModifiedDate),
  }
}
