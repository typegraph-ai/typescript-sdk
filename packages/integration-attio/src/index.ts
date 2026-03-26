// Manifest (the primary export)
export { AttioIntegration } from './manifest.js'

// Zod models (data contracts)
export {
  AttioContactSchema,
  AttioCompanySchema,
  AttioTaskSchema,
} from './models.js'
export type { AttioContact, AttioCompany, AttioTask } from './models.js'

// Raw API types
export type {
  AttioListRecordsResponse,
  AttioListObjectsResponse,
  AttioListTasksResponse,
  AttioRawRecord,
  AttioRawObject,
  AttioRawTask,
  AttioRawAttributeValue,
  AttioApiError,
} from './types.js'

// Mappers
export { toAttioContact } from './mappers/to-contact.js'
export { toAttioCompany } from './mappers/to-company.js'
export { toAttioTask } from './mappers/to-task.js'

// Jobs
export { contactsJob } from './jobs/contacts.js'
export { companiesJob } from './jobs/companies.js'
export { tasksJob } from './jobs/tasks.js'

// Actions (plain functions — call directly with an ApiClient)
export { listRecords, ListRecordsInput, ListRecordsOutput } from './actions/list-records.js'
