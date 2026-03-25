import type { GoogleRawDriveFile } from '../types.js'
import type { GoogleDriveFolder } from '../models.js'

/**
 * Transform a raw Google Drive API file (with folder mimeType) into a normalized GoogleDriveFolder.
 */
export function toGoogleDriveFolder(raw: GoogleRawDriveFile): GoogleDriveFolder {
  return {
    id: raw.id,
    name: raw.name,
    mimeType: 'application/vnd.google-apps.folder',
    parents: raw.parents,
  }
}
