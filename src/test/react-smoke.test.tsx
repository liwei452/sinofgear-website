import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PageHero from '@/components/PageHero'

describe('React test transform', () => {
  it('renders a JSX element', () => {
    render(<h1>React smoke test</h1>)
    expect(screen.getByRole('heading', { name: 'React smoke test' })).toBeInTheDocument()
  })

  it('renders inner-page introductions on a bright editorial surface', () => {
    const { container } = render(
      <PageHero eyebrow="Manufacturing" title="Drawing-led review" subtitle="Review the complete brief." />,
    )

    expect(screen.getByRole('banner', { name: 'Drawing-led review' })).toBeInTheDocument()
    expect(container.querySelector('.bg-steel')).not.toBeInTheDocument()
  })
})
