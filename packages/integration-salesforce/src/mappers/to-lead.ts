import type { SalesforceRawLead } from '../types.js'
import type { SalesforceLead } from '../models.js'

/**
 * Transform a raw Salesforce SOQL Lead record into a normalized SalesforceLead.
 */
export function toSalesforceLead(raw: SalesforceRawLead): SalesforceLead {
  return {
    id: raw.Id,
    firstName: raw.FirstName ?? undefined,
    lastName: raw.LastName,
    email: raw.Email ?? undefined,
    company: raw.Company ?? undefined,
    title: raw.Title ?? undefined,
    status: raw.Status,
    phone: raw.Phone ?? undefined,
    industry: raw.Industry ?? undefined,
    createdDate: new Date(raw.CreatedDate),
  }
}
