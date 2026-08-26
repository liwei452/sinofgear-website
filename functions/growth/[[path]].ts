import { handleGrowthRequest, type GrowthContext } from '../lib/growthPublishing'

export const onRequest = (context: GrowthContext) => handleGrowthRequest(context)
