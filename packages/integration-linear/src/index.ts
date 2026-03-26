// Manifest (the primary export)
export { LinearIntegration } from './manifest.js'

// Zod models (data contracts)
export {
  LinearIssueSchema,
  LinearProjectSchema,
  LinearTeamSchema,
} from './models.js'
export type { LinearIssue, LinearProject, LinearTeam } from './models.js'

// Raw API types
export type {
  LinearIssuesResponse,
  LinearProjectsResponse,
  LinearTeamsResponse,
  LinearRawIssue,
  LinearRawProject,
  LinearRawTeam,
  LinearPageInfo,
  LinearConnection,
  LinearGraphQLResponse,
  LinearApiError,
} from './types.js'

// Mappers
export { toLinearIssue, toIssueDocument } from './mappers/to-issue.js'
export { toLinearProject } from './mappers/to-project.js'
export { toLinearTeam } from './mappers/to-team.js'

// Jobs
export { issuesJob } from './jobs/issues.js'

// Actions (plain functions - call directly with an ApiClient)
export { listIssues, ListIssuesInput, ListIssuesOutput } from './actions/list-issues.js'
