import { describe, expect, it, vi } from 'vitest'
import { OpenAiCapabilityExtractor } from './openAiExtractor.js'

describe('OpenAiCapabilityExtractor', () => {
  it('sends documents as file input and validates the structured result', async () => {
    const parse = vi.fn(async (_input: unknown) => ({
      output_parsed: {
        summary: '可按图加工齿轮',
        capabilities: [{
          category: 'PRODUCT', name: '定制齿轮', value: '按图加工',
          evidenceQuote: 'custom gears by drawing', sourceLocator: '第 2 页',
          confidence: 0.88, recommendedStatus: 'PENDING_REVIEW',
        }],
        interviewQuestions: ['最大模数是多少？'],
      },
    }))
    const extractor = new OpenAiCapabilityExtractor({ responses: { parse } }, 'test-model')
    const result = await extractor.extract({
      filename: 'catalog.pdf',
      contentType: 'application/pdf',
      bytes: Buffer.from('%PDF catalog'),
      projectContext: 'SINOFORM 齿轮工厂',
    })

    expect(result.capabilities[0].evidenceQuote).toBe('custom gears by drawing')
    const request = parse.mock.calls[0]![0] as { model: string; input: unknown }
    expect(request.model).toBe('test-model')
    expect(JSON.stringify(request.input)).toContain('input_file')
    expect(JSON.stringify(request.input)).toContain('只提取资料中明确出现的事实')
  })

  it('sends images as image input', async () => {
    const parse = vi.fn(async (_input: unknown) => ({
      output_parsed: { summary: '图片信息有限', capabilities: [], interviewQuestions: ['请补充参数表'] },
    }))
    const extractor = new OpenAiCapabilityExtractor({ responses: { parse } }, 'test-model')
    await extractor.extract({
      filename: 'machine.jpg', contentType: 'image/jpeg', bytes: Buffer.from('image'), projectContext: '',
    })
    const request = parse.mock.calls[0]![0] as { input: unknown }
    expect(JSON.stringify(request.input)).toContain('input_image')
  })
})
