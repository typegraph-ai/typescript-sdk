import { z } from 'zod'

// ── Files ──

export const GoogleDriveOwnerSchema = z.object({
  displayName: z.string().optional(),
  emailAddress: z.string().optional(),
  photoLink: z.string().optional(),
})

export const GoogleDriveFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  mimeType: z.string(),
  size: z.string().optional(),
  webViewLink: z.string().optional(),
  webContentLink: z.string().optional(),
  createdTime: z.string().optional(),
  modifiedTime: z.string().optional(),
  owners: z.array(GoogleDriveOwnerSchema).optional(),
  parents: z.array(z.string()).optional(),
  trashed: z.boolean().optional(),
  shared: z.boolean().optional(),
})
export type GoogleDriveFile = z.infer<typeof GoogleDriveFileSchema>

// ── Folders ──

export const GoogleDriveFolderSchema = z.object({
  id: z.string(),
  name: z.string(),
  mimeType: z.literal('application/vnd.google-apps.folder'),
  parents: z.array(z.string()).optional(),
})
export type GoogleDriveFolder = z.infer<typeof GoogleDriveFolderSchema>
