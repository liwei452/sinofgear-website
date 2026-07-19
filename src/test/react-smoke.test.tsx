import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('React test transform', () => {
  it('renders a JSX element', () => {
    render(<h1>React smoke test</h1>)
    expect(screen.getByRole('heading', { name: 'React smoke test' })).toBeInTheDocument()
  })
})
