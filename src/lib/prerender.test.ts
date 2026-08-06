import { describe, expect, it } from 'vitest'
import { prepareRootElement } from './prerender'

describe('prepareRootElement', () => {
  it('removes the crawlable shell before the client app mounts', () => {
    const root = document.createElement('div')
    root.setAttribute('data-prerendered', '')
    root.innerHTML = '<main>Static article</main>'

    prepareRootElement(root)

    expect(root).toBeEmptyDOMElement()
    expect(root).not.toHaveAttribute('data-prerendered')
  })

  it('does not change the normal development root', () => {
    const root = document.createElement('div')
    root.innerHTML = '<span>Keep me</span>'

    prepareRootElement(root)

    expect(root).toHaveTextContent('Keep me')
  })
})
