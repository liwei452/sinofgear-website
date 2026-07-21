import { capabilityExtractionSchema, type CapabilityExtraction } from '@workbench/contracts'
import { zodTextFormat } from 'openai/helpers/zod'
import type { CapabilityExtractor, CapabilityExtractorInput } from './capabilityExtractor.js'
import { PermanentAiError, RetryableAiError } from './capabilityExtractor.js'

export const extractionPolicy = `
你是外贸工厂能力证据整理助手。只提取资料中明确出现的事实，不得从图片、宣传语或常识推断能力。
每项能力必须引用最小且足以支持该结论的原文，并标出页码、表格、工作表或图片位置。
默认使用 PENDING_REVIEW；缺少技术参数支撑的营销表述使用 NEEDS_EVIDENCE。
不得自行推断认证、精度、产能、交期、材料范围或质量等级，也不得把愿望写成既有能力。
不确定点必须放入 interviewQuestions，供团队访谈工厂后确认。所有输出使用简体中文。
`.trim()

interface ResponsesClient {
  responses: {
    parse(input: never): Promise<{ output_parsed: unknown }>
  }
}

function userContent(input: CapabilityExtractorInput) {
  const context = {
    type: 'input_text' as const,
    text: `项目背景：${input.projectContext || '未提供'}\n请从附件提取可审核的工厂能力证据。`,
  }
  const dataUrl = `data:${input.contentType};base64,${input.bytes.toString('base64')}`
  if (input.contentType.startsWith('image/')) {
    return [context, { type: 'input_image' as const, image_url: dataUrl, detail: 'high' as const }]
  }
  return [context, {
    type: 'input_file' as const,
    filename: input.filename,
    file_data: dataUrl,
  }]
}

function classifyProviderError(error: unknown) {
  const status = (error as { status?: number }).status
  const code = (error as { code?: string }).code ?? (status ? `HTTP_${status}` : 'OPENAI_REQUEST_FAILED')
  if (status === 408 || status === 409 || status === 429 || (status !== undefined && status >= 500)) {
    return new RetryableAiError(code)
  }
  return new PermanentAiError(code)
}

export class OpenAiCapabilityExtractor implements CapabilityExtractor {
  constructor(private readonly client: ResponsesClient, private readonly model: string) {}

  async extract(input: CapabilityExtractorInput): Promise<CapabilityExtraction> {
    try {
      const response = await this.client.responses.parse({
        model: this.model,
        input: [
          { role: 'system', content: extractionPolicy },
          { role: 'user', content: userContent(input) },
        ],
        text: {
          format: zodTextFormat(capabilityExtractionSchema, 'factory_capability_extraction'),
        },
      } as never)
      if (!response.output_parsed) throw new PermanentAiError('EMPTY_STRUCTURED_OUTPUT')
      return capabilityExtractionSchema.parse(response.output_parsed)
    } catch (error) {
      if (error instanceof PermanentAiError || error instanceof RetryableAiError) throw error
      if (error instanceof Error && error.name === 'ZodError') {
        throw new PermanentAiError('INVALID_STRUCTURED_OUTPUT')
      }
      throw classifyProviderError(error)
    }
  }
}
