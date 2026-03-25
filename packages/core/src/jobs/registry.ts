import type { JobTypeDefinition, JobCategory } from '../types/job.js'

/**
 * Built-in job types available out of the box.
 * Integration packages register additional types via registerJobType().
 */
const builtInJobTypes: Record<string, JobTypeDefinition> = {
  url_scrape: {
    type: 'url_scrape',
    label: 'URL Scrape',
    description: 'Scrape and index a single web page',
    category: 'ingestion',
    requiresSource: true,
    available: true,
    configSchema: [
      { key: 'url', label: 'URL', type: 'url', required: true },
    ],
  },
  domain_crawl: {
    type: 'domain_crawl',
    label: 'Domain Crawl',
    description: 'Crawl and index pages from a domain',
    category: 'ingestion',
    requiresSource: true,
    available: true,
    configSchema: [
      { key: 'domain', label: 'Domain', type: 'url', required: true },
      { key: 'max_pages', label: 'Max Pages', type: 'number', required: false, placeholder: '100' },
    ],
  },
  file_upload: {
    type: 'file_upload',
    label: 'File Upload',
    description: 'Upload and index files into a source',
    category: 'ingestion',
    requiresSource: true,
    available: true,
    configSchema: [],
  },
  custom: {
    type: 'custom',
    label: 'Custom',
    description: 'User-defined job with arbitrary config',
    category: 'custom',
    requiresSource: false,
    available: true,
    configSchema: [],
  },
}

const registry = new Map<string, JobTypeDefinition>(
  Object.entries(builtInJobTypes)
)

/**
 * Register a new job type. Used by integration packages to add
 * their job types (e.g. 'slack_messages', 'hubspot_contacts').
 */
export function registerJobType(def: JobTypeDefinition): void {
  registry.set(def.type, def)
}

/**
 * Unregister a job type by its type key.
 */
export function unregisterJobType(type: string): boolean {
  return registry.delete(type)
}

/**
 * Get a job type definition by its type key.
 */
export function getJobType(type: string): JobTypeDefinition | undefined {
  return registry.get(type)
}

/**
 * List all registered job types.
 */
export function listJobTypes(): JobTypeDefinition[] {
  return [...registry.values()]
}

/**
 * List job types filtered by category.
 */
export function listJobTypesByCategory(category: JobCategory): JobTypeDefinition[] {
  return [...registry.values()].filter(j => j.category === category)
}

export { builtInJobTypes }
