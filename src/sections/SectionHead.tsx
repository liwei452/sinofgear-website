interface Props {
  eyebrow: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  dark?: boolean
}

export default function SectionHead({ eyebrow, title, subtitle, align = 'center', dark = false }: Props) {
  return (
    <div className={`reveal max-w-3xl ${align === 'center' ? 'mx-auto text-center' : ''} mb-12 lg:mb-16`}>
      <span
        className={`inline-block text-xs font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full ${
          dark ? 'bg-white/10 text-sky-300' : 'bg-accent text-accent-foreground'
        }`}
      >
        {eyebrow}
      </span>
      <h2
        className={`mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-balance ${
          dark ? 'text-white' : 'text-foreground'
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-base sm:text-lg leading-relaxed ${dark ? 'text-slate-300' : 'text-muted-foreground'}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
