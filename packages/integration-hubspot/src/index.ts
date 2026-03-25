// Manifest (the primary export)
export { HubSpotIntegration } from './manifest.js'

// Zod models (data contracts)
export {
  HubSpotContactSchema,
  HubSpotCompanySchema,
  HubSpotDealSchema,
} from './models.js'
export type { HubSpotContact, HubSpotCompany, HubSpotDeal } from './models.js'

// Raw API types
export type {
  HubSpotContactsListResponse,
  HubSpotCompaniesListResponse,
  HubSpotDealsListResponse,
  HubSpotRawContact,
  HubSpotRawCompany,
  HubSpotRawDeal,
  HubSpotApiError,
} from './types.js'

// Mappers
export { toHubSpotContact } from './mappers/to-contact.js'
export { toHubSpotCompany } from './mappers/to-company.js'
export { toHubSpotDeal } from './mappers/to-deal.js'

// Jobs
export { contactsJob } from './jobs/contacts.js'
export { companiesJob } from './jobs/companies.js'
export { dealsJob } from './jobs/deals.js'

// Actions
export { createContactAction } from './actions/create-contact.js'
