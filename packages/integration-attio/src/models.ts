import { z } from 'zod'

// ── Contacts ──

export const AttioContactSchema = z.object({
  id: z.string(),
  name: z.string(),
  emailAddresses: z.array(z.string()),
  phoneNumbers: z.array(z.string()),
  company: z.string().optional(),
  title: z.string().optional(),
  createdAt: z.date().optional(),
})
export type AttioContact = z.infer<typeof AttioContactSchema>

// ── Companies ──

export const AttioCompanySchema = z.object({
  id: z.string(),
  name: z.string(),
  domains: z.array(z.string()),
  industry: z.string().optional(),
  size: z.string().optional(),
  createdAt: z.date().optional(),
})
export type AttioCompany = z.infer<typeof AttioCompanySchema>

// ── Tasks ──

export const AttioTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  status: z.string().optional(),
  assignee: z.string().optional(),
  dueDate: z.date().optional(),
  priority: z.string().optional(),
  createdAt: z.date().optional(),
})
export type AttioTask = z.infer<typeof AttioTaskSchema>
