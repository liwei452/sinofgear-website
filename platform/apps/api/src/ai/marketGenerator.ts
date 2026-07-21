import { marketGenerationSchema, type MarketGeneration } from '@workbench/contracts'
import { zodTextFormat } from 'openai/helpers/zod'
import { PermanentAiError, RetryableAiError } from './capabilityExtractor.js'

export interface ConfirmedCapabilityInput { id: string; category: string; name: string; value: string; evidenceQuote: string }
export interface MarketGeneratorInput { projectContext: string; capabilities: ConfirmedCapabilityInput[] }
export interface MarketGenerator { generate(input: MarketGeneratorInput): Promise<MarketGeneration> }

export class FakeMarketGenerator implements MarketGenerator {
  async generate(input: MarketGeneratorInput): Promise<MarketGeneration> {
    const capability = input.capabilities[0]
    if (!capability) throw new PermanentAiError('NO_CONFIRMED_CAPABILITIES')
    return { candidates: [
      ['工业齿轮定制', '德国', '包装设备制造商'],
      ['小批量传动齿轮', '美国', '工业自动化集成商'],
      ['替换维修齿轮', '东南亚', '设备维修与备件经销商'],
    ].map(([productFocus, region, customerType], index) => ({
      productFocus: productFocus!, region: region!, customerType: customerType!,
      rationale: `与已确认的“${capability.name}”能力相关；实际需求、竞争和订单价值尚未验证。`,
      capabilityIds: [capability.id], uncertainties: ['采购频率、认证门槛和目标订单规模尚未核实'],
      interviewQuestions: ['该方向常见图纸、材料和批量是否落在工厂稳定能力内？'],
      scores: { capabilityFit: 4, evidenceStrength: 1, discoverability: 3 + (index % 2), deliveryConfidence: 3, technicalRisk: 2 + (index % 2) },
    })) }
  }
}

interface ResponsesClient { responses: { parse(input: never): Promise<{ output_parsed: unknown }> } }
const policy = `仅基于已确认的工厂能力提出 3 至 5 个产品—区域—客户类型假设。不得虚构市场需求、竞争强弱、价格、订单价值或采购量；这些信息必须写入 uncertainties 或 research questions，并视为尚未验证。每个候选必须引用至少一项输入能力。五项分数分别展示，不得计算隐藏总分。使用简体中文。`

export class OpenAiMarketGenerator implements MarketGenerator {
  constructor(private readonly client: ResponsesClient, private readonly model: string) {}
  async generate(input: MarketGeneratorInput) {
    try {
      const response = await this.client.responses.parse({ model: this.model, input: [{ role: 'system', content: policy }, { role: 'user', content: JSON.stringify(input) }], text: { format: zodTextFormat(marketGenerationSchema, 'market_candidate_generation') } } as never)
      if (!response.output_parsed) throw new PermanentAiError('EMPTY_MARKET_OUTPUT')
      return marketGenerationSchema.parse(response.output_parsed)
    } catch (error) {
      if (error instanceof PermanentAiError || error instanceof RetryableAiError) throw error
      const status=(error as {status?:number}).status
      if(status===429||(status!==undefined&&status>=500)) throw new RetryableAiError('MARKET_PROVIDER_UNAVAILABLE')
      throw new PermanentAiError('INVALID_MARKET_OUTPUT')
    }
  }
}
