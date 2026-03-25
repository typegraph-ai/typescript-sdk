import type { IntegrationJobDefinition } from '@d8um/integration-core'
import type { RawDocument } from '@d8um/core'
import type { JobRunContext } from '@d8um/core'

/**
 * Fetches contacts from a HubSpot CRM workspace.
 *
 * High-level flow:
 * 1. Call GET /crm/v3/objects/contacts with cursor-based pagination (after param)
 * 2. Request properties: email, firstname, lastname, phone, company, lifecyclestage, createdate
 * 3. Transform each contact into a RawDocument via toHubSpotContact mapper
 * 4. Yield each document
 * 5. Follow paging.next.after for next page until no more pages
 */
export const contactsJob: IntegrationJobDefinition = {
  name: 'contacts',
  description: 'Fetches contacts from HubSpot CRM',
  entity: 'HubSpotContact',
  frequency: 'daily',
  type: 'full',
  scopes: ['crm.objects.contacts.read'],
  configSchema: [
    {
      key: 'properties',
      label: 'Contact Properties to Fetch',
      type: 'text',
      required: false,
    },
    {
      key: 'limit',
      label: 'Page Size',
      type: 'number',
      required: false,
    },
  ],

  async *run(ctx: JobRunContext): AsyncIterable<RawDocument> {
    // 1. Initialize pagination cursor
    // let after: string | undefined
    //
    // 2. Define properties to fetch
    // const properties = 'email,firstname,lastname,phone,company,lifecyclestage,createdate'
    //
    // 3. Loop through pages
    // do {
    //   const response = await ctx.client!.get<HubSpotContactsListResponse>(
    //     '/crm/v3/objects/contacts',
    //     {
    //       limit: '100',
    //       properties,
    //       ...(after ? { after } : {}),
    //     }
    //   )
    //
    //   for (const contact of response.data.results) {
    //     const mapped = toHubSpotContact(contact)
    //     yield {
    //       id: `hubspot-contact-${contact.id}`,
    //       content: [mapped.firstName, mapped.lastName, mapped.email].filter(Boolean).join(' '),
    //       title: [mapped.firstName, mapped.lastName].filter(Boolean).join(' ') || mapped.email || contact.id,
    //       updatedAt: new Date(contact.updatedAt),
    //       metadata: mapped,
    //     }
    //   }
    //
    //   after = response.data.paging?.next?.after
    // } while (after)

    throw new Error('HubSpotIntegration contacts job is not yet implemented')
  },
}
