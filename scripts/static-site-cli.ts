import { resolve } from 'node:path'
import { generateStaticSite } from './static-site'

await generateStaticSite({
  distDir: resolve('dist'),
  siteUrl: process.env.VITE_SITE_URL?.trim() || 'https://sinfogear.com',
})
