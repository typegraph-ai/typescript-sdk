/**
 * Raw Google Drive API v3 response types.
 * These represent what the Google Drive API actually returns before normalization.
 */

// ── Files List ──

export interface GoogleDriveFilesListResponse {
  kind: 'drive#fileList'
  nextPageToken?: string | undefined
  incompleteSearch?: boolean | undefined
  files: GoogleRawDriveFile[]
}

export interface GoogleRawDriveFile {
  kind: 'drive#file'
  id: string
  name: string
  mimeType: string
  description?: string | undefined
  starred?: boolean | undefined
  trashed?: boolean | undefined
  explicitlyTrashed?: boolean | undefined
  parents?: string[] | undefined
  properties?: Record<string, string> | undefined
  spaces?: string[] | undefined
  version?: string | undefined
  webContentLink?: string | undefined
  webViewLink?: string | undefined
  iconLink?: string | undefined
  hasThumbnail?: boolean | undefined
  thumbnailLink?: string | undefined
  thumbnailVersion?: string | undefined
  viewedByMe?: boolean | undefined
  viewedByMeTime?: string | undefined
  createdTime?: string | undefined
  modifiedTime?: string | undefined
  modifiedByMeTime?: string | undefined
  modifiedByMe?: boolean | undefined
  sharedWithMeTime?: string | undefined
  sharingUser?: {
    displayName?: string | undefined
    kind: string
    emailAddress?: string | undefined
    photoLink?: string | undefined
  } | undefined
  owners?: Array<{
    displayName?: string | undefined
    kind: string
    emailAddress?: string | undefined
    photoLink?: string | undefined
    me?: boolean | undefined
  }> | undefined
  teamDriveId?: string | undefined
  driveId?: string | undefined
  lastModifyingUser?: {
    displayName?: string | undefined
    kind: string
    emailAddress?: string | undefined
    photoLink?: string | undefined
    me?: boolean | undefined
  } | undefined
  shared?: boolean | undefined
  ownedByMe?: boolean | undefined
  capabilities?: Record<string, boolean> | undefined
  viewersCanCopyContent?: boolean | undefined
  copyRequiresWriterPermission?: boolean | undefined
  writersCanShare?: boolean | undefined
  fullFileExtension?: string | undefined
  originalFilename?: string | undefined
  fileExtension?: string | undefined
  md5Checksum?: string | undefined
  size?: string | undefined
  quotaBytesUsed?: string | undefined
  headRevisionId?: string | undefined
  isAppAuthorized?: boolean | undefined
}

// ── File Get ──

export interface GoogleDriveFileGetResponse extends GoogleRawDriveFile {
  // Same shape as GoogleRawDriveFile, but returned from files.get
  // May include additional fields based on requested fields parameter
  exportLinks?: Record<string, string> | undefined
}

// ── About ──

export interface GoogleDriveAboutResponse {
  kind: 'drive#about'
  user: {
    displayName: string
    photoLink?: string | undefined
    me: boolean
    emailAddress?: string | undefined
  }
  storageQuota: {
    limit?: string | undefined
    usage: string
    usageInDrive: string
    usageInDriveTrash: string
  }
  maxUploadSize?: string | undefined
}

// ── Generic ──

export interface GoogleDriveApiError {
  error: {
    code: number
    message: string
    status: string
    errors: Array<{
      message: string
      domain: string
      reason: string
      location?: string | undefined
      locationType?: string | undefined
    }>
  }
}
