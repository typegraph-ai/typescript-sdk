// ── Memory Scope ──
// Multi-level scoping for memory isolation and sharing.
// Inspired by Mem0's user/agent/run model, extended with groupId for shared contexts.

export interface MemoryScope {
  /** Organization-level isolation */
  tenantId?: string | undefined
  /** Shared memory for a team, channel, project, or multi-participant session */
  groupId?: string | undefined
  /** Individual memory owner */
  userId?: string | undefined
  /** Specific agent's memory */
  agentId?: string | undefined
  /** Conversation session */
  sessionId?: string | undefined
}

/**
 * Build a scope from partial parts. At least one identifier is required.
 */
export function buildScope(parts: Partial<MemoryScope>): MemoryScope {
  const scope: MemoryScope = {}
  if (parts.tenantId !== undefined) scope.tenantId = parts.tenantId
  if (parts.groupId !== undefined) scope.groupId = parts.groupId
  if (parts.userId !== undefined) scope.userId = parts.userId
  if (parts.agentId !== undefined) scope.agentId = parts.agentId
  if (parts.sessionId !== undefined) scope.sessionId = parts.sessionId

  if (!scope.tenantId && !scope.groupId && !scope.userId && !scope.agentId && !scope.sessionId) {
    throw new Error('MemoryScope requires at least one identifier (tenantId, groupId, userId, agentId, or sessionId)')
  }

  return scope
}

/**
 * Deterministic string key for a scope. Used for Map keys and cache lookups.
 */
export function scopeKey(scope: MemoryScope): string {
  const parts: string[] = []
  if (scope.tenantId) parts.push(`t:${scope.tenantId}`)
  if (scope.groupId) parts.push(`g:${scope.groupId}`)
  if (scope.userId) parts.push(`u:${scope.userId}`)
  if (scope.agentId) parts.push(`a:${scope.agentId}`)
  if (scope.sessionId) parts.push(`s:${scope.sessionId}`)
  return parts.join('|')
}

/**
 * Check if a record's scope matches a query scope.
 *
 * A record matches if every field present in the query scope
 * is also present and equal in the record scope.
 * Extra fields in the record scope are ignored - the query
 * acts as a "subset filter".
 *
 * Examples:
 *   query { groupId: 'team-alpha' } matches record { groupId: 'team-alpha', userId: 'alice' }
 *   query { userId: 'alice' } does NOT match record { userId: 'bob' }
 *   query { userId: 'alice', sessionId: 's1' } matches record { userId: 'alice', sessionId: 's1', tenantId: 'org' }
 */
export function scopeMatches(record: MemoryScope, query: MemoryScope): boolean {
  if (query.tenantId !== undefined && record.tenantId !== query.tenantId) return false
  if (query.groupId !== undefined && record.groupId !== query.groupId) return false
  if (query.userId !== undefined && record.userId !== query.userId) return false
  if (query.agentId !== undefined && record.agentId !== query.agentId) return false
  if (query.sessionId !== undefined && record.sessionId !== query.sessionId) return false
  return true
}

/**
 * Convert a scope to a flat Record for storage queries.
 * Only includes defined fields.
 */
export function scopeToFilter(scope: MemoryScope): Record<string, string> {
  const filter: Record<string, string> = {}
  if (scope.tenantId) filter['tenantId'] = scope.tenantId
  if (scope.groupId) filter['groupId'] = scope.groupId
  if (scope.userId) filter['userId'] = scope.userId
  if (scope.agentId) filter['agentId'] = scope.agentId
  if (scope.sessionId) filter['sessionId'] = scope.sessionId
  return filter
}
