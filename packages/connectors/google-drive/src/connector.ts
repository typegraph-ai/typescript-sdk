import type { Connector, RawDocument } from '@d8um/core'

export interface GoogleDriveConnectorConfig {
  /** OAuth2 credentials or service account key. */
  credentials: {
    accessToken?: string | undefined
    refreshToken?: string | undefined
    clientId?: string | undefined
    clientSecret?: string | undefined
    serviceAccountKey?: string | undefined
  }
  /** Folder IDs to sync. If omitted, syncs the entire drive. */
  folderIds?: string[] | undefined
  /** MIME types to include. Default: Docs, Sheets, Slides, PDFs, and plain text. */
  mimeTypes?: string[] | undefined
  /** Include files in shared drives. Default: false. */
  includeSharedDrives?: boolean | undefined
  /** Maximum files to fetch. Default: unlimited. */
  maxFiles?: number | undefined
}

export type GoogleDriveMeta = {
  fileId: string
  mimeType: string
  driveId?: string | undefined
  parentFolderId?: string | undefined
  owners: string[]
  lastModifiedBy?: string | undefined
  shared: boolean
}

export class GoogleDriveConnector implements Connector<GoogleDriveMeta> {
  constructor(private config: GoogleDriveConnectorConfig) {}

  async *fetch(): AsyncIterable<RawDocument<GoogleDriveMeta>> {
    // TODO: Implement Google Drive API integration
    // 1. Authenticate with OAuth2 or service account
    // 2. List files (drive.files.list) with optional folder/mimeType filters
    // 3. For each file, export content (drive.files.export for Google Docs,
    //    drive.files.get for binary files with text extraction)
    // 4. Yield each file as a RawDocument
    throw new Error('GoogleDriveConnector is not yet implemented')
  }

  async *fetchSince(since: Date): AsyncIterable<RawDocument<GoogleDriveMeta>> {
    // TODO: Implement incremental sync using modifiedTime filter
    throw new Error('GoogleDriveConnector.fetchSince is not yet implemented')
  }
}
