import { parseGeneratedArticle, type GeneratedArticlePayload } from '../../src/data/generatedArticleContract'

export interface KvLike {
  get(key: string): Promise<string | null>
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>
}

export interface GrowthPublishingEnv {
  BLOG_PREVIEWS: KvLike
  GROWTH_PUBLISH_TOKEN: string
  GROWTH_ORGANIZATION_ID: string
  GITHUB_CONTENT_TOKEN: string
  GITHUB_REPOSITORY: string
  GITHUB_BRANCH: string
}

export interface GrowthContext {
  request: Request
  env: GrowthPublishingEnv
}

type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

function json(body: unknown, status = 200, headers: HeadersInit = {}) {
  return Response.json(body, { status, headers: { 'cache-control': 'no-store', ...headers } })
}

function authorized(request: Request, env: GrowthPublishingEnv): boolean {
  return Boolean(env.GROWTH_PUBLISH_TOKEN)
    && request.headers.get('authorization') === `Bearer ${env.GROWTH_PUBLISH_TOKEN}`
}

function encodedContent(value: unknown): string {
  const bytes = new TextEncoder().encode(`${JSON.stringify(value, null, 2)}\n`)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function decodedContent(value: string): unknown {
  const binary = atob(value.replace(/\s/g, ''))
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
  return JSON.parse(new TextDecoder().decode(bytes))
}

async function body(request: Request, articleKey: string, env: GrowthPublishingEnv): Promise<GeneratedArticlePayload> {
  const value = await request.json() as GeneratedArticlePayload
  if (value.article_key !== articleKey) throw new Error('article_key')
  if (value.organization_id !== env.GROWTH_ORGANIZATION_ID) throw new Error('organization_id')
  if (value.site_code !== 'sinofgears') throw new Error('site_code')
  parseGeneratedArticle(value)
  return value
}

function githubFileUrl(env: GrowthPublishingEnv, articleKey: string): string {
  return `https://api.github.com/repos/${env.GITHUB_REPOSITORY}/contents/content/blog/${articleKey}.json`
}

function githubHeaders(env: GrowthPublishingEnv): HeadersInit {
  return {
    accept: 'application/vnd.github+json',
    authorization: `Bearer ${env.GITHUB_CONTENT_TOKEN}`,
    'content-type': 'application/json',
    'x-github-api-version': '2022-11-28',
  }
}

async function preview(context: GrowthContext, articleKey: string) {
  const article = await body(context.request, articleKey, context.env)
  await context.env.BLOG_PREVIEWS.put(
    `preview:${articleKey}:v${article.version}`,
    JSON.stringify(article),
    { expirationTtl: 7 * 24 * 60 * 60 },
  )
  const origin = new URL(context.request.url).origin
  return json({
    status: 'PREVIEW_READY',
    preview_url: `${origin}/growth-preview/${articleKey}?version=${article.version}`,
  }, 201)
}

async function publish(context: GrowthContext, articleKey: string, fetcher: Fetcher) {
  const article = await body(context.request, articleKey, context.env)
  const fileUrl = githubFileUrl(context.env, articleKey)
  const existing = await fetcher(`${fileUrl}?ref=${encodeURIComponent(context.env.GITHUB_BRANCH)}`, {
    headers: githubHeaders(context.env),
  })
  let currentFileVersion = ''
  if (existing.ok) {
    const stored = await existing.json() as { content?: string; sha?: string }
    const current = stored.content ? decodedContent(stored.content) as { version?: number } : {}
    if (Number(current.version) > article.version) return json({ detail: 'A newer article version is already stored.' }, 409)
    if (Number(current.version) === article.version) {
      await context.env.BLOG_PREVIEWS.put(`publication:${articleKey}`, JSON.stringify({ article_key: articleKey, version: article.version }))
      return json({ status: 'PUBLISHING' }, 202)
    }
    currentFileVersion = stored.sha ?? ''
  } else if (existing.status !== 404) {
    return json({ detail: 'GitHub content is temporarily unavailable.' }, 502)
  }
  const requestBody: Record<string, unknown> = {
    message: `content: publish ${articleKey} v${article.version}`,
    content: encodedContent(article),
    branch: context.env.GITHUB_BRANCH,
  }
  if (currentFileVersion) requestBody.sha = currentFileVersion
  const committed = await fetcher(fileUrl, {
    method: 'PUT', headers: githubHeaders(context.env), body: JSON.stringify(requestBody),
  })
  if (!committed.ok) return json({ detail: 'The website repository did not accept the article.' }, 502)
  await context.env.BLOG_PREVIEWS.put(
    `publication:${articleKey}`,
    JSON.stringify({ article_key: articleKey, version: article.version }),
  )
  return json({ status: 'PUBLISHING' }, 202)
}

async function status(context: GrowthContext, articleKey: string, fetcher: Fetcher) {
  const raw = await context.env.BLOG_PREVIEWS.get(`publication:${articleKey}`)
  if (!raw) return json({ status: 'NEEDS_ATTENTION', error_message: 'No publication is in progress.' }, 404)
  const publication = JSON.parse(raw) as { article_key: string; version: number }
  const canonicalUrl = `${new URL(context.request.url).origin}/blog/${articleKey}`
  const live = await fetcher(`${canonicalUrl}?publication-version=${publication.version}`, { headers: { 'cache-control': 'no-cache' } })
  const html = live.ok ? await live.text() : ''
  if (
    html.includes(`data-article-key="${articleKey}"`)
    && html.includes(`data-article-version="${publication.version}"`)
  ) return json({ status: 'PUBLISHED', canonical_url: canonicalUrl })
  return json({ status: 'PUBLISHING' }, 202)
}

export async function handleGrowthRequest(context: GrowthContext, fetcher: Fetcher = fetch): Promise<Response> {
  if (!authorized(context.request, context.env)) return json({ detail: 'Unauthorized.' }, 401)
  const path = new URL(context.request.url).pathname
  const match = /^\/growth\/v1\/articles\/([a-z0-9]+(?:-[a-z0-9]+)*)\/(preview|publish|status)$/.exec(path)
  try {
    if (match && context.request.method === 'POST' && match[2] === 'preview') return await preview(context, match[1])
    if (match && context.request.method === 'POST' && match[2] === 'publish') return await publish(context, match[1], fetcher)
    if (match && context.request.method === 'GET' && match[2] === 'status') return await status(context, match[1], fetcher)
    if (path === '/growth/v1/pages' && context.request.method === 'GET') {
      const index = await fetcher(`${new URL(context.request.url).origin}/growth-content-index.json`)
      return index.ok ? json(await index.json()) : json([], 200)
    }
    return json({ detail: 'Not found.' }, 404)
  } catch (error) {
    const field = error instanceof Error ? error.message : 'article'
    return json({ detail: `Invalid article field: ${field}` }, 422)
  }
}
