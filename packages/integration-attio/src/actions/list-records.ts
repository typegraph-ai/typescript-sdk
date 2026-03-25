import { z } from 'zod'
import type { IntegrationActionDefinition } from '@d8um/integration-core'
import type { ApiClient } from '@d8um/core'

const ListRecordsInputSchema = z.object({
  object: z.string().describe('Object API slug (e.g. "people", "companies")'),
  page_size: z.number().optional().describe('Number of records per page'),
  page_token: z.string().optional().describe('Pagination token for next page'),
})

const ListRecordsOutputSchema = z.object({
  records: z.array(z.record(z.unknown())),
  next_page_token: z.string().optional(),
  total: z.number(),
})

export const listRecordsAction: IntegrationActionDefinition = {
  name: 'list-records',
  description: 'List records for a given Attio object type',
  inputSchema: ListRecordsInputSchema,
  outputSchema: ListRecordsOutputSchema,
  scopes: ['records:read', 'objects:read'],

  async run(ctx: { client: ApiClient }, input: unknown): Promise<unknown> {
    // const parsed = ListRecordsInputSchema.parse(input)
    // const response = await ctx.client.post<AttioListRecordsResponse>(
    //   `objects/${parsed.object}/records/query`,
    //   {
    //     page_size: parsed.page_size ?? 100,
    //     ...(parsed.page_token ? { page_token: parsed.page_token } : {}),
    //   }
    // )
    //
    // return {
    //   records: response.data.data.map(record => ({
    //     id: record.id.record_id,
    //     values: record.values,
    //     created_at: record.created_at,
    //   })),
    //   next_page_token: response.data.next_page_token,
    //   total: response.data.data.length,
    // }

    throw new Error('AttioIntegration list-records action is not yet implemented')
  },
}
