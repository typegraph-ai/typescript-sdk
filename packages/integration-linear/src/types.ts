/**
 * Raw Linear GraphQL API response types.
 * These represent what the Linear API actually returns before normalization.
 * Linear uses a relay-style nodes/edges pattern with cursor-based pagination.
 */

// ── Pagination ──

export interface LinearPageInfo {
  hasNextPage: boolean
  endCursor?: string | undefined
}

export interface LinearConnection<T> {
  nodes: T[]
  edges: Array<{
    node: T
    cursor: string
  }>
  pageInfo: LinearPageInfo
}

// ── Issues ──

export interface LinearIssuesResponse {
  data: {
    issues: LinearConnection<LinearRawIssue>
  }
}

export interface LinearRawIssue {
  id: string
  identifier: string
  title: string
  description?: string | undefined
  priority: number
  priorityLabel: string
  state: {
    id: string
    name: string
    type: string
    color: string
  }
  assignee?: {
    id: string
    name: string
    email: string
    displayName: string
    avatarUrl?: string | undefined
  } | undefined
  labels: {
    nodes: Array<{
      id: string
      name: string
      color: string
    }>
  }
  team: {
    id: string
    name: string
    key: string
  }
  project?: {
    id: string
    name: string
  } | undefined
  cycle?: {
    id: string
    name?: string | undefined
    number: number
  } | undefined
  createdAt: string
  updatedAt: string
  dueDate?: string | undefined
  estimate?: number | undefined
  url: string
  number: number
  branchName: string
}

// ── Projects ──

export interface LinearProjectsResponse {
  data: {
    projects: LinearConnection<LinearRawProject>
  }
}

export interface LinearRawProject {
  id: string
  name: string
  description?: string | undefined
  slugId: string
  state: string
  progress: number
  startDate?: string | undefined
  targetDate?: string | undefined
  startedAt?: string | undefined
  completedAt?: string | undefined
  canceledAt?: string | undefined
  lead?: {
    id: string
    name: string
    email: string
  } | undefined
  members: {
    nodes: Array<{
      id: string
      name: string
      email: string
    }>
  }
  teams: {
    nodes: Array<{
      id: string
      name: string
      key: string
    }>
  }
  url: string
  createdAt: string
  updatedAt: string
}

// ── Teams ──

export interface LinearTeamsResponse {
  data: {
    teams: LinearConnection<LinearRawTeam>
  }
}

export interface LinearRawTeam {
  id: string
  name: string
  key: string
  description?: string | undefined
  private: boolean
  timezone?: string | undefined
  members: {
    nodes: Array<{
      id: string
      name: string
      email: string
      displayName: string
      active: boolean
    }>
  }
  createdAt: string
  updatedAt: string
}

// ── Generic ──

export interface LinearGraphQLResponse<T> {
  data: T
  errors?: Array<{
    message: string
    locations?: Array<{ line: number; column: number }> | undefined
    path?: string[] | undefined
    extensions?: Record<string, unknown> | undefined
  }> | undefined
}

export interface LinearApiError {
  errors: Array<{
    message: string
    extensions?: {
      code: string
      userPresentableMessage?: string | undefined
    } | undefined
  }>
}
