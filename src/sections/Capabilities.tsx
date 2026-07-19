import { Cog, Disc3, Wrench, Flame, Scissors, Ruler } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useLang } from '@/i18n/LanguageContext'
import SectionHead from './SectionHead'

const icons = [Cog, Disc3, Wrench, Flame, Scissors, Ruler]

export default function Capabilities() {
  const { t } = useLang()

  return (
    <section id="capabilities" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead
          eyebrow={t.capabilities.eyebrow}
          title={t.capabilities.title}
          subtitle={t.capabilities.subtitle}
        />

        <div className="grid items-start gap-10 lg:grid-cols-5">
          {/* factory image */}
          <div className="reveal relative lg:col-span-2 lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-2xl shadow-xl shadow-primary/15">
              <img
                src="/assets/factory.jpg"
                alt={t.capabilities.factoryImgAlt}
                loading="lazy"
                className="aspect-[3/2] w-full object-cover lg:aspect-auto lg:h-[520px]"
              />
            </div>
            <div className="absolute -bottom-5 left-5 right-5 sm:right-auto rounded-xl bg-primary px-5 py-4 text-white shadow-lg">
              <p className="text-2xl font-extrabold">120+ CNC</p>
              <p className="text-xs text-sky-200">{t.stats.machines.label}</p>
            </div>
          </div>

          {/* capability cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-3">
            {t.capabilities.items.map((c, idx) => {
              const Icon = icons[idx % icons.length]
              return (
                <div
                  key={c.title}
                  className="reveal rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                  style={{ animationDelay: `${idx * 70}ms` }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-3 text-[15px] font-bold leading-snug">{c.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* materials & standards */}
        <div className="reveal mt-14 grid gap-6 rounded-2xl border bg-secondary/60 p-6 sm:p-8 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
              {t.capabilities.materialsTitle}
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {t.capabilities.materials.map((m) => (
                <Badge key={m} variant="outline" className="bg-white text-xs font-medium">
                  {m}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
              {t.capabilities.standardsTitle}
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {t.capabilities.standards.map((s) => (
                <Badge key={s} className="bg-primary/90 text-xs font-medium">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
