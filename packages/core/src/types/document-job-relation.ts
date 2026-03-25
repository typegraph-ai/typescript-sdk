/**
 * Tracks the many-to-many relationship between documents and jobs.
 *
 * A single document can be related to multiple jobs:
 * - Created by a `url_scrape` job
 * - Modified by a `reindex` job
 * - Touched by a `content_cleanup` job
 *
 * This enables smart cascade delete: when a job is deleted with cascade=true,
 * only documents where that job is the SOLE related job are deleted.
 * Documents touched by other active jobs survive.
 */
export type DocumentJobRelationType = 'created' | 'modified'

export interface DocumentJobRelation {
  documentId: string
  jobId: string
  relation: DocumentJobRelationType
  timestamp: Date
}

export interface DocumentJobRelationFilter {
  documentId?: string | undefined
  jobId?: string | undefined
  relation?: DocumentJobRelationType | undefined
}
