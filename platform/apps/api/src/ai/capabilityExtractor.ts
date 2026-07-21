import type { CapabilityExtraction } from '@workbench/contracts'

export interface CapabilityExtractorInput {
  filename: string
  contentType: string
  bytes: Buffer
  projectContext: string
}

export interface CapabilityExtractor {
  extract(input: CapabilityExtractorInput): Promise<CapabilityExtraction>
}

export class RetryableAiError extends Error {
  constructor(readonly code: string, message = code) {
    super(message)
    this.name = 'RetryableAiError'
  }
}

export class PermanentAiError extends Error {
  constructor(readonly code: string, message = code) {
    super(message)
    this.name = 'PermanentAiError'
  }
}

export class FakeCapabilityExtractor implements CapabilityExtractor {
  async extract(input: CapabilityExtractorInput): Promise<CapabilityExtraction> {
    return {
      summary: `已读取 ${input.filename}，以下内容等待团队逐条核实。`,
      capabilities: [{
        category: 'PRODUCT',
        name: '齿轮定制加工',
        value: '可依据客户图纸讨论定制需求',
        evidenceQuote: `资料文件：${input.filename}`,
        sourceLocator: '模拟提取结果（请替换为真实资料页码）',
        confidence: 0.6,
        recommendedStatus: 'PENDING_REVIEW',
      }],
      interviewQuestions: ['该产品能力是否稳定量产，并有可公开的技术参数或案例支持？'],
    }
  }
}
