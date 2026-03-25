import type { AttioRawRecord } from '../types.js'
import type { AttioContact } from '../models.js'

/**
 * Transform a raw Attio API record (people object) into a normalized AttioContact.
 *
 * Attio stores attribute values as arrays keyed by attribute slug.
 * Each value entry has an attribute_type and type-specific fields.
 */
export function toAttioContact(raw: AttioRawRecord): AttioContact {
  const values = raw.values

  // Extract full name from the 'name' attribute (person name type)
  const nameValues = values['name'] ?? []
  const fullName = nameValues[0]?.full_name
    ?? [nameValues[0]?.first_name, nameValues[0]?.last_name].filter(Boolean).join(' ')
    ?? ''

  // Extract email addresses from the 'email_addresses' attribute
  const emailValues = values['email_addresses'] ?? []
  const emailAddresses = emailValues
    .map(v => v.email_address)
    .filter((e): e is string => !!e)

  // Extract phone numbers from the 'phone_numbers' attribute
  const phoneValues = values['phone_numbers'] ?? []
  const phoneNumbers = phoneValues
    .map(v => v.original_value ?? v.phone_number)
    .filter((p): p is string => !!p)

  // Extract company from the 'company' record reference attribute
  const companyValues = values['company'] ?? []
  const company = companyValues[0]?.value ?? undefined

  // Extract title/job_title attribute
  const titleValues = values['job_title'] ?? values['title'] ?? []
  const title = titleValues[0]?.value ?? undefined

  return {
    id: raw.id.record_id,
    name: fullName,
    emailAddresses,
    phoneNumbers,
    company,
    title,
    createdAt: raw.created_at ? new Date(raw.created_at) : undefined,
  }
}
