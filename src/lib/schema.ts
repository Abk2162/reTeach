import { z } from 'zod'

export const Topic = z.object({
  id: z.string(),
  name: z.string(),
  weight: z.number().min(0).max(1),
  prereqs: z.array(z.string()).default([])
})

export const Question = z.object({
  id: z.string(),
  topic: z.string(),
  stem: z.string(),
  options: z.array(z.string()).length(3),
  answerIndex: z.number().int().min(0).max(2),
  rationale: z.string().optional(),
  difficulty: z.enum(['easy', 'med', 'hard']).default('easy'),
  bloom: z.enum(['remember', 'understand', 'apply', 'analyze']).default('remember')
})

export const TopicStat = z.object({
  topic: z.string(),
  n: z.number().int(),
  correctPct: z.number()
})

export const DiagnosticRow = z.object({
  id: z.string(),
  slug: z.string(),
  formUuid: z.string(),
  name: z.string(),
  course: z.string(),
  createdAt: z.string(),
  responses: z.number().int().min(0),
  completionPct: z.number().min(0).max(100),
  weakTopics: z.array(z.string()).max(3),
  strongTopics: z.array(z.string()).max(3),
  status: z.enum(['active', 'archived', 'draft', 'published']).default('active'),
  avgScore: z.number().min(0).max(100).optional(),
  lastSubmission: z.string().optional().nullable()
})

export const StudentFlag = z.object({
  student: z.string(),
  scorePct: z.number().min(0).max(100)
})

export const Preview = z.object({
  id: z.string(),
  title: z.string(),
  course: z.string(),
  updatedAt: z.string(),
  assigned: z.number().int().min(0),
  responses: z.number().int().min(0),
  completionPct: z.number().min(0).max(100),
  avgScorePct: z.number().min(0).max(100),
  p25: z.number().min(0).max(100),
  p50: z.number().min(0).max(100),
  p75: z.number().min(0).max(100),
  atRisk: z.number().int().min(0),
  topics: z.array(
    z.object({
      name: z.string(),
      n: z.number().int().min(0),
      correctPct: z.number().min(0).max(100)
    })
  ),
  distBins: z.array(
    z.object({
      range: z.tuple([z.number(), z.number()]),
      n: z.number().int().min(0)
    })
  ),
  subgroups: z
    .array(
      z.object({
        name: z.string(),
        n: z.number().int().min(0),
        scorePct: z.number().min(0).max(100)
      })
    )
    .optional()
})

export type Topic = z.infer<typeof Topic>
export type Question = z.infer<typeof Question>
export type TopicStat = z.infer<typeof TopicStat>
export type DiagnosticRow = z.infer<typeof DiagnosticRow>
export type StudentFlag = z.infer<typeof StudentFlag>
export type Preview = z.infer<typeof Preview>
