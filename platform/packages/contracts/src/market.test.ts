import { describe, expect, it } from 'vitest'
import { marketGenerationSchema } from './market.js'

describe('marketGenerationSchema', () => {
  it('requires between three and five candidates', () => {
    expect(marketGenerationSchema.safeParse({ candidates: [] }).success).toBe(false)
  })
})
