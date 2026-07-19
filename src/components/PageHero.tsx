interface PageHeroProps {
  eyebrow: string
  title: string
  subtitle: string
  compact?: boolean
}

export default function PageHero({ eyebrow, title, subtitle, compact = false }: PageHeroProps) {
  return (
    <section className={`relative overflow-hidden bg-steel ${compact ? 'py-14 lg:py-20' : 'py-20 lg:py-28'}`}>
      <div className="absolute inset-0 bg-industrial-grid opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-400">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl text-balance text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">{subtitle}</p>
      </div>
    </section>
  )
}
