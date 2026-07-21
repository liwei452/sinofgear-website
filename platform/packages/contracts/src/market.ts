import { z } from 'zod'

export const marketCandidateSchema = z.object({
  productFocus: z.string().trim().min(1),
  region: z.string().trim().min(1),
  customerType: z.string().trim().min(1),
  rationale: z.string().trim().min(1),
  capabilityIds: z.array(z.string().trim().min(1)).min(1),
  uncertainties: z.array(z.string().trim().min(1)),
  interviewQuestions: z.array(z.string().trim().min(1)),
  scores: z.object({
    capabilityFit: z.number().int().min(1).max(5),
    evidenceStrength: z.number().int().min(1).max(5),
    discoverability: z.number().int().min(1).max(5),
    deliveryConfidence: z.number().int().min(1).max(5),
    technicalRisk: z.number().int().min(1).max(5),
  }),
})

export const marketGenerationSchema = z.object({
  candidates: z.array(marketCandidateSchema).min(3).max(5),
})

export type MarketCandidateDraft = z.infer<typeof marketCandidateSchema>
export type MarketGeneration = z.infer<typeof marketGenerationSchema>
