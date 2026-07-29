import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { LanguageProvider, useLang } from './LanguageContext'
import { LANGUAGE_STORAGE_KEY } from './language'

function Probe() {
  const { lang, setLang, t } = useLang()
  return (
    <>
      <output aria-label="language">{lang}</output>
      <output aria-label="products">{t('nav.products')}</output>
      <button onClick={() => setLang('es')}>choose Spanish</button>
    </>
  )
}

describe('LanguageProvider', () => {
  beforeEach(() => localStorage.clear())

  it('starts and remains in English when IP country is unmapped', async () => {
    render(
      <LanguageProvider detectCountry={async () => 'FR'}>
        <Probe />
      </LanguageProvider>,
    )

    expect(screen.getByLabelText('language')).toHaveTextContent('en')
    await act(async () => undefined)
    expect(screen.getByLabelText('language')).toHaveTextContent('en')
  })

  it('does not allow a delayed IP result to overwrite a manual choice', async () => {
    let finishDetection!: (country: string) => void
    const detectCountry = () => new Promise<string>((resolve) => {
      finishDetection = resolve
    })

    render(
      <LanguageProvider detectCountry={detectCountry}>
        <Probe />
      </LanguageProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'choose Spanish' }))
    expect(screen.getByLabelText('language')).toHaveTextContent('es')
    expect(screen.getByLabelText('products')).toHaveTextContent('Productos')

    await act(async () => finishDetection('DE'))

    expect(screen.getByLabelText('language')).toHaveTextContent('es')
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('es')
    expect(document.documentElement.lang).toBe('es')
  })
})
