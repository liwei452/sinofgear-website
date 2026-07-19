import { Send, SearchCheck, PackageCheck, Factory, Ship } from 'lucide-react'
import { useLang } from '@/i18n/LanguageContext'
import SectionHead from './SectionHead'

const icons = [Send, SearchCheck, PackageCheck, Factory, Ship]

export default function Process() {
  const { t } = useLang()

  return (
    <section id="process" className="py-20 lg:py-28 bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead
          eyebrow={t.process.eyebrow}
          title={t.process.title}
          subtitle={t.process.subtitle}
        />

        <ol className="relative grid gap-6 md:grid-cols-3 lg:grid-cols-5">
          {/* connecting line (desktop) */}
          <div className="pointer-events-none absolute left-0 right-0 top-9 hidden h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent lg:block" />
          {t.process.steps.map((s, idx) => {
            const Icon = icons[idx % icons.length]
            return (
              <li
                key={s.title}
                className="reveal relative rounded-2xl border bg-card p-6 pt-8 text-center shadow-sm"
                style={{ animationDelay: `${idx * 90}ms` }}
              >
                <span className="absolute -top-5 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 ring-4 ring-secondary">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-extrabold tracking-widest text-primary/60">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-1 font-bold leading-snug">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
