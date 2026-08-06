import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { articles } from '../src/data/articles'
import { generateStaticSite } from './static-site'

const temporaryDirectories: string[] = []
const template = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>SINOF Custom Gears</title><meta name="description" content="Default description"></head><body><div id="root"></div><script type="module" src="/assets/app.js"></script></body></html>`

async function createDist() {
  const directory = await mkdtemp(join(tmpdir(), 'sinoform-static-'))
  temporaryDirectories.push(directory)
  await writeFile(join(directory, 'index.html'), template, 'utf8')
  return directory
}

afterEach(async () => {
  const { rm } = await import('node:fs/promises')
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })))
})

describe('static blog generation', () => {
  it('writes a crawlable blog index and six article pages', async () => {
    const distDir = await createDist()
    await generateStaticSite({ distDir, siteUrl: 'https://sinfogear.com' })

    const blogIndex = await readFile(join(distDir, 'blog', 'index.html'), 'utf8')
    expect(blogIndex).toContain('<title>Gear Sourcing Insights | SINOF</title>')
    expect(blogIndex).toContain('<h1>Gear Sourcing Insights</h1>')
    expect(blogIndex.match(/data-static-article-card/g)).toHaveLength(6)

    for (const article of articles) {
      const html = await readFile(join(distDir, 'blog', article.slug, 'index.html'), 'utf8')
      expect(html).toContain(`<title>${article.title} | SINOF</title>`)
      expect(html).toContain(`<h1>${article.title}</h1>`)
      expect(html).toContain(`<link rel="canonical" href="https://sinfogear.com/blog/${article.slug}">`)
      expect(html).toContain('"@type":"BlogPosting"')
      expect(html).toContain(article.sections[0].blocks[0].type === 'paragraph' ? article.sections[0].blocks[0].text : article.excerpt)
      expect(html).toContain('Request drawing review')
      expect(html).toContain('data-prerendered')
    }
  })

  it('escapes article text before writing it into HTML', async () => {
    const distDir = await createDist()
    await generateStaticSite({ distDir, siteUrl: 'https://sinfogear.com' })

    const standardsArticle = articles.find((article) => article.slug.includes('iso-1328'))!
    const html = await readFile(join(distDir, 'blog', standardsArticle.slug, 'index.html'), 'utf8')
    expect(html).toContain('Grade 5–6')
    expect(html).not.toContain('<script>alert(')
  })
})
