import { z } from 'zod'
import type { IntegrationActionDefinition } from '@d8um/integration-core'
import type { ApiClient } from '@d8um/core'
import { GoogleDriveFileSchema } from '../models.js'

const ListFilesInputSchema = z.object({
  query: z.string().optional().describe('Search query (Drive API q parameter)'),
  folderId: z.string().optional().describe('Folder ID to list files from'),
  mimeType: z.string().optional().describe('Filter by MIME type'),
  maxResults: z.number().optional().describe('Max files to return'),
  orderBy: z.string().optional().describe('Sort order (e.g. modifiedTime desc)'),
})

const ListFilesOutputSchema = z.object({
  files: z.array(GoogleDriveFileSchema),
  total: z.number(),
})

export const listFilesAction: IntegrationActionDefinition = {
  name: 'list-files',
  description: 'List files from Google Drive',
  inputSchema: ListFilesInputSchema,
  outputSchema: ListFilesOutputSchema,
  scopes: ['https://www.googleapis.com/auth/drive'],

  async run(ctx: { client: ApiClient }, input: unknown): Promise<unknown> {
    // const parsed = ListFilesInputSchema.parse(input)
    // const files: GoogleDriveFile[] = []
    // let pageToken: string | undefined
    //
    // const queryParts: string[] = ['trashed = false']
    // if (parsed.folderId) queryParts.push(`'${parsed.folderId}' in parents`)
    // if (parsed.mimeType) queryParts.push(`mimeType = '${parsed.mimeType}'`)
    // if (parsed.query) queryParts.push(`fullText contains '${parsed.query}'`)
    //
    // do {
    //   const response = await ctx.client.get<GoogleDriveFilesListResponse>(
    //     '/drive/v3/files',
    //     {
    //       q: queryParts.join(' and '),
    //       fields: 'nextPageToken,files(id,name,mimeType,size,webViewLink,webContentLink,createdTime,modifiedTime,owners,parents,trashed,shared)',
    //       pageSize: '100',
    //       ...(parsed.orderBy ? { orderBy: parsed.orderBy } : {}),
    //       ...(pageToken ? { pageToken } : {}),
    //     }
    //   )
    //
    //   for (const file of response.data.files) {
    //     files.push(toGoogleDriveFile(file))
    //     if (parsed.maxResults && files.length >= parsed.maxResults) break
    //   }
    //
    //   pageToken = response.data.nextPageToken
    // } while (pageToken && (!parsed.maxResults || files.length < parsed.maxResults))
    //
    // return { files, total: files.length }

    throw new Error('GoogleDriveIntegration list-files action is not yet implemented')
  },
}
