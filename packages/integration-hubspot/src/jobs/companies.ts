import type { IntegrationJobDefinition } from '@d8um/integration-core'
import type { RawDocument } from '@d8um/core'
import type { JobRunContext } from '@d8um/core'

/**
 * Fetches companies from a HubSpot CRM workspace.
 *
 * High-level flow:
 * 1. Call GET /crm/v3/objects/companies with cursor-based pagination (after param)
 * 2. Request properties: name, domain, industry, type, city, state, country
 * 3. Transform each company into a RawDocument via toHubSpotCompany mapper
 * 4. Yield each document
 * 5. Follow paging.next.after for next page until no more pages
 */
export const companiesJob: IntegrationJobDefinition = {
  name: 'companies',
  description: 'Fetches companies from HubSpot CRM',
  entity: 'HubSpotCompany',
  frequency: 'daily',
  type: 'full',
  scopes: ['crm.objects.companies.read'],
  configSchema: [
    {
      key: 'properties',
      label: 'Company Properties to Fetch',
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
    // const properties = 'name,domain,industry,type,city,state,country'
    //
    // 3. Loop through pages
    // do {
    //   const response = await ctx.client!.get<HubSpotCompaniesListResponse>(
    //     '/crm/v3/objects/companies',
    //     {
    //       limit: '100',
    //       properties,
    //       ...(after ? { after } : {}),
    //     }
    //   )
    //
    //   for (const company of response.data.results) {
    //     const mapped = toHubSpotCompany(company)
    //     yield {
    //       id: `hubspot-company-${company.id}`,
    //       content: [mapped.name, mapped.domain, mapped.industry].filter(Boolean).join(' '),
    //       title: mapped.name || mapped.domain || company.id,
    //       updatedAt: new Date(company.updatedAt),
    //       metadata: mapped,
    //     }
    //   }
    //
    //   after = response.data.paging?.next?.after
    // } while (after)

    throw new Error('HubSpotIntegration companies job is not yet implemented')
  },
}
