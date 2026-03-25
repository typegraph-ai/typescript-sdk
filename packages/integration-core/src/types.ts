import type { RawDocument } from '@d8um/core'
import type { ApiClient, JobRunContext, ConfigField } from '@d8um/core'
import type { z } from 'zod'

// ── Integration Manifest ──

/**
 * Complete definition of a 3rd party integration.
 * Each integration package exports one of these as its primary export.
 */
export interface IntegrationDefinition {
  /** Unique identifier, e.g. 'slack', 'hubspot' */
  id: string
  /** Human-readable name */
  name: string
  description: string
  author: string
  category: IntegrationCategory

  /** Whether this integration connects at the workspace or individual level */
  scope: 'workspace' | 'individual'
  /** Who can initiate a connection */
  connectPermission: 'admin' | 'member'

  /**
   * Auth requirements — describes WHAT is needed, not HOW to do it.
   * The consuming app provides the auth implementation (e.g. Nango, Clerk, etc.)
   */
  auth: {
    type: 'oauth2' | 'api_key' | 'oauth2_cc'
    scopes: string[]
    tokenType?: 'bearer' | 'basic' | undefined
  }

  /** API surface description */
  api: {
    baseUrl: string
    type: 'rest' | 'graphql'
    endpoints: Record<string, string>
  }

  /** What this integration supports */
  features: {
    jobs: boolean
    actions: boolean
    webhooks: boolean
    incrementalJobs: boolean
  }

  /** Display metadata for UI */
  display: {
    /** Logo filename co-located in the package root (e.g. 'logo.png') */
    logo: string
    permissionsSummary: string[]
    aboutSummary: string
  }

  /** Data fetching job definitions */
  jobs: IntegrationJobDefinition[]
  /** One-off action definitions */
  actions: IntegrationActionDefinition[]
  /** Entity names this integration provides (e.g. ['messages', 'channels', 'users']) */
  entities: string[]
}

export type IntegrationCategory =
  | 'crm'
  | 'communication'
  | 'productivity'
  | 'sales'
  | 'storage'
  | 'finance'

// ── Integration Job Definition ──

/**
 * Defines a data fetching job provided by an integration.
 * These register as job types in @d8um/core's registry when installed.
 *
 * The `run` function is a framework stub — it defines the high-level
 * structure of what the job does but the actual API calls are not
 * implemented yet.
 */
export interface IntegrationJobDefinition {
  /** Job name, becomes part of the job type key (e.g. 'messages' -> 'slack_messages') */
  name: string
  description: string
  /** Output entity name — maps to a Zod model key in the integration's models.ts */
  entity: string
  /** Suggested run frequency */
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly'
  /** Whether this job supports incremental fetching */
  type: 'incremental' | 'full'
  /** Auth scopes required by this specific job */
  scopes: string[]
  /** Config fields for this job type */
  configSchema: ConfigField[]
  /** The job runner — yields RawDocuments from the 3rd party API */
  run: (ctx: JobRunContext) => AsyncIterable<RawDocument>
}

// ── Integration Action Definition ──

/**
 * Defines a one-off action provided by an integration
 * (e.g. send a message, create a contact).
 */
export interface IntegrationActionDefinition {
  name: string
  description: string
  inputSchema: z.ZodType
  outputSchema: z.ZodType
  /** Auth scopes required by this action */
  scopes: string[]
  run: (ctx: { client: ApiClient }, input: unknown) => Promise<unknown>
}
