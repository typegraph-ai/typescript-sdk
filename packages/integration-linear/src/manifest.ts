import type { IntegrationDefinition } from '@d8um/integration-core'
import { issuesJob } from './jobs/issues.js'
import { listIssuesAction } from './actions/list-issues.js'

export const LinearIntegration: IntegrationDefinition = {
  id: 'linear',
  name: 'Linear',
  description: 'Project management and issue tracking',
  author: 'Linear',
  category: 'productivity',
  scope: 'workspace',
  connectPermission: 'admin',

  auth: {
    type: 'oauth2',
    scopes: [
      'read',
      'write',
      'issues:create',
      'issues:read',
    ],
  },

  api: {
    baseUrl: 'https://api.linear.app',
    type: 'graphql',
    endpoints: {
      graphql: '/graphql',
    },
  },

  features: {
    jobs: true,
    actions: true,
    webhooks: true,
    incrementalJobs: true,
  },

  display: {
    logo: 'logo.webp',
    permissionsSummary: [
      'Read issues & projects',
      'Create issues',
      'Access team data',
    ],
    aboutSummary: 'Project management and issue tracking',
  },

  jobs: [issuesJob],
  actions: [listIssuesAction],
  entities: ['issues', 'projects', 'teams'],
}
