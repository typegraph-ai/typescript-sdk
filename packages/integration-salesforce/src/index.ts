// Manifest (the primary export)
export { SalesforceIntegration } from './manifest.js'

// Zod models (data contracts)
export {
  SalesforceContactSchema,
  SalesforceAccountSchema,
  SalesforceOpportunitySchema,
  SalesforceLeadSchema,
} from './models.js'
export type {
  SalesforceContact,
  SalesforceAccount,
  SalesforceOpportunity,
  SalesforceLead,
} from './models.js'

// Raw API types
export type {
  SalesforceQueryResponse,
  SalesforceRawContact,
  SalesforceRawAccount,
  SalesforceRawOpportunity,
  SalesforceRawLead,
  SalesforceApiError,
  SalesforceApiErrorResponse,
} from './types.js'

// Mappers
export { toSalesforceContact } from './mappers/to-contact.js'
export { toSalesforceAccount } from './mappers/to-account.js'
export { toSalesforceOpportunity } from './mappers/to-opportunity.js'
export { toSalesforceLead } from './mappers/to-lead.js'

// Jobs
export { contactsJob } from './jobs/contacts.js'
export { accountsJob } from './jobs/accounts.js'
export { opportunitiesJob } from './jobs/opportunities.js'

// Actions (plain functions — call directly with an ApiClient)
export { queryRecords, QueryRecordsInput, QueryRecordsOutput } from './actions/query-records.js'
