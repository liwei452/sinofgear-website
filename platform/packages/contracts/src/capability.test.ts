import { describe, expect, it } from 'vitest'
import { capabilityExtractionSchema } from './capability.js'

describe('capabilityExtractionSchema', () => {
  it('rejects confidence outside zero to one', () => {
    const result = capabilityExtractionSchema.safeParse({
      summary: '测试',
      capabilities: [{
        category: 'PRODUCT',
        name: '斜齿轮',
        value: '按图加工',
        evidenceQuote: 'Custom helical gears',
        sourceLocator: '第 1 页',
        confidence: 1.2,
        recommendedStatus: 'PENDING_REVIEW',
      }],
      interviewQuestions: [],
    })

    expect(result.success).toBe(false)
  })
})
