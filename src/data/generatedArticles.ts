import type { Article } from './articleTypes'
import { parseGeneratedArticle } from './generatedArticleContract'

type GeneratedModule = { default: unknown } | unknown

export function loadGeneratedArticleModules(modules: Record<string, GeneratedModule>): Article[] {
  return Object.values(modules)
    .map((module) => parseGeneratedArticle(
      module && typeof module === 'object' && 'default' in module
        ? (module as { default: unknown }).default
        : module,
    ))
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt) || left.slug.localeCompare(right.slug))
}

export function mergeArticles(legacy: Article[], generated: Article[]): Article[] {
  const slugs = new Set(legacy.map(({ slug }) => slug))
  for (const article of generated) {
    if (slugs.has(article.slug)) throw new Error(`Duplicate article slug: ${article.slug}`)
    slugs.add(article.slug)
  }
  return [...legacy, ...generated]
}

const modules = import.meta.glob('../../content/blog/*.json', { eager: true, import: 'default' })

export const generatedArticles = loadGeneratedArticleModules(modules)
