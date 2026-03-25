import { z } from 'zod'

// ── Issues ──

export const LinearIssueSchema = z.object({
  id: z.string(),
  identifier: z.string(),
  title: z.string(),
  description: z.string().optional(),
  priority: z.number().min(0).max(4),
  state: z.object({
    name: z.string(),
    type: z.string(),
  }),
  assignee: z.object({
    name: z.string(),
    email: z.string().optional(),
  }).optional(),
  labels: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
  dueDate: z.date().optional(),
  estimate: z.number().optional(),
  url: z.string(),
})
export type LinearIssue = z.infer<typeof LinearIssueSchema>

// ── Projects ──

export const LinearProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  state: z.string(),
  progress: z.number(),
  startDate: z.date().optional(),
  targetDate: z.date().optional(),
  lead: z.object({
    name: z.string(),
  }).optional(),
  url: z.string(),
})
export type LinearProject = z.infer<typeof LinearProjectSchema>

// ── Teams ──

export const LinearTeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  key: z.string(),
  description: z.string().optional(),
  members: z.array(z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().optional(),
  })),
})
export type LinearTeam = z.infer<typeof LinearTeamSchema>
