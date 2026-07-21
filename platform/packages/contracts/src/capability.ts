import { z } from 'zod'

export const capabilityReviewStatusSchema = z.enum([
  'PENDING_REVIEW',
  'CONFIRMED',
  'NEEDS_EVIDENCE',
  'INTERNAL_ONLY',
  'REJECTED',
])

export const capabilityDraftSchema = z.object({
  category: z.enum([
    'PRODUCT',
    'MATERIAL',
    'PROCESS',
    'DIMENSION',
    'PRECISION',
    'APPLICATION',
    'DELIVERY',
    'QUALITY',
    'OTHER',
  ]),
  name: z.string().trim().min(1),
  value: z.string().trim().min(1),
  evidenceQuote: z.string().trim().min(1),
  sourceLocator: z.string().trim().min(1),
  confidence: z.number().min(0).max(1),
  recommendedStatus: capabilityReviewStatusSchema,
})

export const capabilityExtractionSchema = z.object({
  summary: z.string().trim().min(1),
  capabilities: z.array(capabilityDraftSchema),
  interviewQuestions: z.array(z.string().trim().min(1)),
})

export type CapabilityReviewStatus = z.infer<typeof capabilityReviewStatusSchema>
export type CapabilityExtraction = z.infer<typeof capabilityExtractionSchema>
