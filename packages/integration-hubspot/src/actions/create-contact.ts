import { z } from 'zod'
import type { IntegrationActionDefinition } from '@d8um/integration-core'
import type { ApiClient } from '@d8um/core'

const CreateContactInputSchema = z.object({
  email: z.string().email().describe('Contact email address'),
  firstName: z.string().optional().describe('Contact first name'),
  lastName: z.string().optional().describe('Contact last name'),
  phone: z.string().optional().describe('Contact phone number'),
  company: z.string().optional().describe('Contact company name'),
  lifecycleStage: z.string().optional().describe('Lifecycle stage (e.g. lead, customer)'),
})

const CreateContactOutputSchema = z.object({
  id: z.string(),
  properties: z.record(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const createContactAction: IntegrationActionDefinition = {
  name: 'create-contact',
  description: 'Create a new contact in HubSpot CRM',
  inputSchema: CreateContactInputSchema,
  outputSchema: CreateContactOutputSchema,
  scopes: ['crm.objects.contacts.read'],

  async run(ctx: { client: ApiClient }, input: unknown): Promise<unknown> {
    // const parsed = CreateContactInputSchema.parse(input)
    // const response = await ctx.client.post('/crm/v3/objects/contacts', {
    //   properties: {
    //     email: parsed.email,
    //     firstname: parsed.firstName,
    //     lastname: parsed.lastName,
    //     phone: parsed.phone,
    //     company: parsed.company,
    //     lifecyclestage: parsed.lifecycleStage,
    //   },
    // })
    // return response.data

    throw new Error('HubSpotIntegration create-contact action is not yet implemented')
  },
}
