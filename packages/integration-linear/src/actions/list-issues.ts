import { z } from 'zod'
import type { IntegrationActionDefinition } from '@d8um/integration-core'
import type { ApiClient } from '@d8um/core'
import { LinearIssueSchema } from '../models.js'

const ListIssuesInputSchema = z.object({
  teamId: z.string().optional().describe('Filter by team ID'),
  status: z.string().optional().describe('Filter by state type (e.g. "started", "completed")'),
  limit: z.number().optional().describe('Max issues to return'),
})

const ListIssuesOutputSchema = z.object({
  issues: z.array(LinearIssueSchema),
  total: z.number(),
})

export const listIssuesAction: IntegrationActionDefinition = {
  name: 'list-issues',
  description: 'List issues from the Linear workspace',
  inputSchema: ListIssuesInputSchema,
  outputSchema: ListIssuesOutputSchema,
  scopes: ['read', 'issues:read'],

  async run(ctx: { client: ApiClient }, input: unknown): Promise<unknown> {
    // const parsed = ListIssuesInputSchema.parse(input)
    // const filter: Record<string, unknown> = {}
    //
    // if (parsed.teamId) {
    //   filter.team = { id: { eq: parsed.teamId } }
    // }
    // if (parsed.status) {
    //   filter.state = { type: { eq: parsed.status } }
    // }
    //
    // const query = `
    //   query Issues($filter: IssueFilter) {
    //     issues(filter: $filter, first: ${parsed.limit ?? 50}) {
    //       nodes {
    //         id identifier title description priority priorityLabel
    //         state { id name type color }
    //         assignee { id name email displayName }
    //         labels { nodes { id name color } }
    //         createdAt updatedAt dueDate estimate url number
    //       }
    //     }
    //   }
    // `
    //
    // const response = await ctx.client.post<LinearIssuesResponse>(
    //   '/graphql',
    //   { query, variables: { filter } }
    // )
    //
    // const issues = response.data.data.issues.nodes.map(toLinearIssue)
    // return { issues, total: issues.length }

    throw new Error('LinearIntegration list-issues action is not yet implemented')
  },
}
