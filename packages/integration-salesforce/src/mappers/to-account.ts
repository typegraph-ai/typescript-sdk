import type { SalesforceRawAccount } from '../types.js'
import type { SalesforceAccount } from '../models.js'

/**
 * Transform a raw Salesforce SOQL Account record into a normalized SalesforceAccount.
 */
export function toSalesforceAccount(raw: SalesforceRawAccount): SalesforceAccount {
  return {
    id: raw.Id,
    name: raw.Name,
    type: raw.Type ?? undefined,
    industry: raw.Industry ?? undefined,
    website: raw.Website ?? undefined,
    phone: raw.Phone ?? undefined,
    billingAddress: (raw.BillingStreet || raw.BillingCity || raw.BillingState || raw.BillingPostalCode || raw.BillingCountry)
      ? {
          street: raw.BillingStreet ?? undefined,
          city: raw.BillingCity ?? undefined,
          state: raw.BillingState ?? undefined,
          postalCode: raw.BillingPostalCode ?? undefined,
          country: raw.BillingCountry ?? undefined,
        }
      : undefined,
    numberOfEmployees: raw.NumberOfEmployees ?? undefined,
    annualRevenue: raw.AnnualRevenue ?? undefined,
    ownerId: raw.OwnerId ?? undefined,
    createdDate: new Date(raw.CreatedDate),
  }
}
