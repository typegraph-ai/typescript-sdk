import { z } from 'zod'

// -- Contacts --

export const HubSpotContactSchema = z.object({
  id: z.string(),
  email: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  lifecycleStage: z.string().optional(),
  createDate: z.date().optional(),
})
export type HubSpotContact = z.infer<typeof HubSpotContactSchema>

// -- Companies --

export const HubSpotCompanySchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  domain: z.string().optional(),
  industry: z.string().optional(),
  type: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
})
export type HubSpotCompany = z.infer<typeof HubSpotCompanySchema>

// -- Deals --

export const HubSpotDealSchema = z.object({
  id: z.string(),
  dealName: z.string().optional(),
  amount: z.number().optional(),
  stage: z.string().optional(),
  pipeline: z.string().optional(),
  closeDate: z.date().optional(),
  ownerName: z.string().optional(),
})
export type HubSpotDeal = z.infer<typeof HubSpotDealSchema>
