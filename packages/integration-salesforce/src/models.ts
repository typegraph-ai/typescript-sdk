import { z } from 'zod'

// ── Contacts ──

export const SalesforceContactSchema = z.object({
  id: z.string(),
  firstName: z.string().optional(),
  lastName: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  accountId: z.string().optional(),
  title: z.string().optional(),
  department: z.string().optional(),
  mailingAddress: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  createdDate: z.date(),
  lastModifiedDate: z.date(),
})
export type SalesforceContact = z.infer<typeof SalesforceContactSchema>

// ── Accounts ──

export const SalesforceAccountSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().optional(),
  phone: z.string().optional(),
  billingAddress: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  numberOfEmployees: z.number().optional(),
  annualRevenue: z.number().optional(),
  ownerId: z.string().optional(),
  createdDate: z.date(),
})
export type SalesforceAccount = z.infer<typeof SalesforceAccountSchema>

// ── Opportunities ──

export const SalesforceOpportunitySchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.number().optional(),
  stageName: z.string(),
  probability: z.number().optional(),
  closeDate: z.date().optional(),
  type: z.string().optional(),
  accountId: z.string().optional(),
  ownerId: z.string().optional(),
  createdDate: z.date(),
  lastModifiedDate: z.date(),
})
export type SalesforceOpportunity = z.infer<typeof SalesforceOpportunitySchema>

// ── Leads ──

export const SalesforceLeadSchema = z.object({
  id: z.string(),
  firstName: z.string().optional(),
  lastName: z.string(),
  email: z.string().optional(),
  company: z.string().optional(),
  title: z.string().optional(),
  status: z.string(),
  phone: z.string().optional(),
  industry: z.string().optional(),
  createdDate: z.date(),
})
export type SalesforceLead = z.infer<typeof SalesforceLeadSchema>
