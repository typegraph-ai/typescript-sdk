import type { SalesforceRawContact } from '../types.js'
import type { SalesforceContact } from '../models.js'

/**
 * Transform a raw Salesforce SOQL Contact record into a normalized SalesforceContact.
 */
export function toSalesforceContact(raw: SalesforceRawContact): SalesforceContact {
  return {
    id: raw.Id,
    firstName: raw.FirstName ?? undefined,
    lastName: raw.LastName,
    email: raw.Email ?? undefined,
    phone: raw.Phone ?? undefined,
    accountId: raw.AccountId ?? undefined,
    title: raw.Title ?? undefined,
    department: raw.Department ?? undefined,
    mailingAddress: (raw.MailingStreet || raw.MailingCity || raw.MailingState || raw.MailingPostalCode || raw.MailingCountry)
      ? {
          street: raw.MailingStreet ?? undefined,
          city: raw.MailingCity ?? undefined,
          state: raw.MailingState ?? undefined,
          postalCode: raw.MailingPostalCode ?? undefined,
          country: raw.MailingCountry ?? undefined,
        }
      : undefined,
    createdDate: new Date(raw.CreatedDate),
    lastModifiedDate: new Date(raw.LastModifiedDate),
  }
}
