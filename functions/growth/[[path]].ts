import { growthPublishing } from '../lib/growthPublishing'

interface GrowthContext {
  request: Request
  env: Parameters<typeof growthPublishing>[0]
}

export const onRequest = ({ request, env }: GrowthContext) => growthPublishing(env).fetch(request)
