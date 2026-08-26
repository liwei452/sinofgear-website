import { useId } from 'react'

interface PageHeroProps {
  eyebrow: string
  title: string
  subtitle: string
  compact?: boolean
}

export default function PageHero({ eyebrow, title, subtitle, compact = false }: PageHeroProps) {
  const titleId = useId()

  return (
    <section
      role="banner"
      aria-labelledby={titleId}
      className={`relative overflow-hidden border-b border-border/80 bg-[hsl(210_45%_98%)] ${compact ? 'py-12 lg:py-16' : 'py-16 lg:py-20'}`}
    >
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] bg-[radial-gradient(circle_at_70%_45%,hsl(207_88%_91%/.72),transparent_64%)] lg:block" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold tracking-[0.14em] text-primary">{eyebrow}</p>
        <h1 id={titleId} className="mt-4 max-w-4xl text-balance text-4xl font-semibold tracking-[-0.035em] text-foreground sm:text-5xl lg:text-[3.5rem] lg:leading-[1.04]">
          {title}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">{subtitle}</p>
      </div>
    </section>
  )
}
