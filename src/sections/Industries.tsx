import { Car, Bot, Plane, Stethoscope, Factory, Tractor } from 'lucide-react'
import { useLang } from '@/i18n/LanguageContext'
import SectionHead from './SectionHead'

const icons = [Car, Bot, Plane, Stethoscope, Factory, Tractor]

export default function Industries() {
  const { t } = useLang()

  return (
    <section id="industries" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead
          eyebrow={t.industries.eyebrow}
          title={t.industries.title}
          subtitle={t.industries.subtitle}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.industries.items.map((it, idx) => {
            const Icon = icons[idx % icons.length]
            return (
              <div
                key={it.name}
                className="reveal group rounded-xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
                style={{ animationDelay: `${(idx % 3) * 80}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-bold">{it.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{it.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
