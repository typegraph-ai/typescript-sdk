import { z } from 'zod'
import type { IntegrationActionDefinition } from '@d8um/integration-core'
import type { ApiClient } from '@d8um/core'
import { GoogleDriveFileSchema } from '../models.js'

const GetFileInputSchema = z.object({
  fileId: z.string().describe('The ID of the file to retrieve'),
  fields: z.string().optional().describe('Comma-separated list of fields to include'),
})

const GetFileOutputSchema = GoogleDriveFileSchema

export const getFileAction: IntegrationActionDefinition = {
  name: 'get-file',
  description: 'Get metadata for a specific file from Google Drive',
  inputSchema: GetFileInputSchema,
  outputSchema: GetFileOutputSchema,
  scopes: ['https://www.googleapis.com/auth/drive'],

  async run(ctx: { client: ApiClient }, input: unknown): Promise<unknown> {
    // const parsed = GetFileInputSchema.parse(input)
    // const fields = parsed.fields ?? 'id,name,mimeType,size,webViewLink,webContentLink,createdTime,modifiedTime,owners,parents,trashed,shared'
    //
    // const response = await ctx.client.get<GoogleDriveFileGetResponse>(
    //   `/drive/v3/files/${parsed.fileId}`,
    //   { fields }
    // )
    //
    // return toGoogleDriveFile(response.data)

    throw new Error('GoogleDriveIntegration get-file action is not yet implemented')
  },
}
