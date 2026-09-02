import { parseGeneratedArticle } from '../../src/data/generatedArticleContract'
import type { ArticleBlock } from '../../src/data/articleTypes'

interface PreviewContext {
  request: Request
  env: { BLOG_PREVIEWS: { get(key: string): Promise<string | null> } }
  params: { article_key?: string }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function renderBlock(block: ArticleBlock): string {
  if (block.type === 'paragraph') return `<p>${escapeHtml(block.text)}</p>`
  if (block.type === 'subheading') return `<h3 id="${escapeHtml(block.id)}">${escapeHtml(block.title)}</h3>`
  if (block.type === 'note') return `<aside><h3>${escapeHtml(block.title)}</h3><p>${escapeHtml(block.text)}</p></aside>`
  if (block.type === 'list') {
    const tag = block.style === 'number' ? 'ol' : 'ul'
    return `<${tag}>${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</${tag}>`
  }
  return `<table><thead><tr>${block.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${block.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`
}

function renderPreview(article: ReturnType<typeof parseGeneratedArticle>): string {
  const sections = article.sections.map((section) => (
    `<section><h2 id="${escapeHtml(section.id)}">${escapeHtml(section.title)}</h2>${section.blocks.map(renderBlock).join('')}</section>`
  )).join('')
  const faq = article.faq.map((item) => `<details><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`).join('')
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${escapeHtml(article.title)} | SINOF Preview</title><style>body{font:16px/1.7 system-ui,sans-serif;color:#10264b;margin:0;background:#f4f8fc}main{max-width:900px;margin:auto;background:#fff;padding:48px}h1{font-size:2.5rem;line-height:1.15}h2{margin-top:2.5rem}table{width:100%;border-collapse:collapse}th,td{border:1px solid #d9e2ec;padding:10px;text-align:left}.notice{background:#eaf4ff;padding:12px 16px} @media(max-width:640px){main{padding:24px}h1{font-size:2rem}}</style></head><body><main><p class="notice">Unpublished review preview · Version ${article.version ?? 1}</p><p>${escapeHtml(article.topic)}</p><h1>${escapeHtml(article.title)}</h1><p>${escapeHtml(article.excerpt)}</p>${sections}<section><h2>Frequently asked questions</h2>${faq}</section></main></body></html>`
}

export async function handleGrowthPreview(context: PreviewContext): Promise<Response> {
  const articleKey = context.params.article_key ?? ''
  const searchParams = new URL(context.request.url).searchParams
  const version = Number(searchParams.get('version'))
  const accessToken = searchParams.get('token')
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(articleKey) || !Number.isInteger(version) || version <= 0) {
    return new Response('Not found', { status: 404 })
  }
  const stored = await context.env.BLOG_PREVIEWS.get(`preview:${articleKey}:v${version}`)
  if (!stored) return new Response('Not found', { status: 404 })
  try {
    const raw = JSON.parse(stored) as { access_token?: unknown; article?: unknown }
    if (!accessToken || typeof raw.access_token !== 'string' || raw.access_token !== accessToken || !raw.article || typeof raw.article !== 'object') {
      return new Response('Not found', { status: 404 })
    }
    const canonical = raw.article as { article_key?: string; version?: number }
    if (canonical.article_key !== articleKey || canonical.version !== version) return new Response('Not found', { status: 404 })
    const article = parseGeneratedArticle(canonical)
    return new Response(renderPreview(article), {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'private, no-store',
        'x-robots-tag': 'noindex, nofollow',
      },
    })
  } catch {
    return new Response('Preview unavailable', { status: 422 })
  }
}

export const onRequest = handleGrowthPreview
