import type { GrowthArticle, GrowthSiteConfig } from './contracts.js'

export function articleError(article: GrowthArticle, config: GrowthSiteConfig): { field: string } | undefined {
  if (!article.article_key || !/^[a-z0-9-]+$/.test(article.article_key) || !Number.isInteger(article.version) || article.version < 1) return { field: 'article_key' }
  if (!config.capabilities.languages.includes(article.language)) return { field: 'language' }
  if (article.seo_description.length > config.capabilities.seo_description_max_length) return { field: 'seo_description' }
  if (article.faq.length < config.capabilities.faq_min_items || article.faq.length > config.capabilities.faq_max_items) return { field: 'faq' }
  if (article.internal_links.some((link) => typeof link.label !== 'string' || typeof link.url !== 'string' || !link.url.startsWith('/') || link.url.startsWith('//') || !config.capabilities.allowed_internal_routes.includes(link.url))) return { field: 'internal_links' }
  if (config.capabilities.cover_image_required && !article.cover_image) return { field: 'cover_image' }
  const cover = article.cover_image
  if (cover && (!/^[A-Za-z0-9._-]+$/.test(cover.filename) || !config.capabilities.image_mime_types.includes(cover.mime_type) || cover.size_bytes > config.capabilities.image_max_bytes || cover.cover_role !== 'HERO')) return { field: 'cover_image' }
  return undefined
}

export function deploymentId(article: GrowthArticle): string { return `${article.article_key}-v${article.version}` }
