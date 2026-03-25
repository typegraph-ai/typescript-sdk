import { z } from 'zod'
import type { IntegrationActionDefinition } from '@d8um/integration-core'
import type { ApiClient } from '@d8um/core'

const QueryRecordsInputSchema = z.object({
  soql: z.string().describe('SOQL query string (e.g. "SELECT Id, Name FROM Account LIMIT 10")'),
})

const QueryRecordsOutputSchema = z.object({
  records: z.array(z.record(z.unknown())),
  totalSize: z.number(),
  done: z.boolean(),
})

export const queryRecordsAction: IntegrationActionDefinition = {
  name: 'query-records',
  description: 'Execute a SOQL query against Salesforce',
  inputSchema: QueryRecordsInputSchema,
  outputSchema: QueryRecordsOutputSchema,
  scopes: ['api'],

  async run(ctx: { client: ApiClient }, input: unknown): Promise<unknown> {
    // const parsed = QueryRecordsInputSchema.parse(input)
    // const response = await ctx.client.get<SalesforceQueryResponse<Record<string, unknown>>>(
    //   `query?q=${encodeURIComponent(parsed.soql)}`
    // )
    //
    // return {
    //   records: response.data.records,
    //   totalSize: response.data.totalSize,
    //   done: response.data.done,
    // }

    throw new Error('SalesforceIntegration query-records action is not yet implemented')
  },
}
