import OpenAI from 'openai'
import { OpenAiCapabilityExtractor } from '../ai/openAiExtractor.js'

if (!process.env.OPENAI_API_KEY) {
  console.log('跳过：未配置 OPENAI_API_KEY')
  process.exit(0)
}
const extractor = new OpenAiCapabilityExtractor(new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) as never, process.env.OPENAI_MODEL ?? 'gpt-5.6-terra')
const result = await extractor.extract({
  filename: 'smoke-test.txt', contentType: 'text/plain',
  bytes: Buffer.from('Factory brochure: custom helical gears according to customer drawings.'),
  projectContext: 'OpenAI 适配器最小连通性测试',
})
console.log(`OpenAI smoke test succeeded with ${result.capabilities.length} capability drafts.`)
