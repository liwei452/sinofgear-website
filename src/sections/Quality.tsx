import { CheckCircle2, ShieldCheck } from 'lucide-react'
import { useLang } from '@/i18n/LanguageContext'
import SectionHead from './SectionHead'

export default function Quality() {
  const { t } = useLang()

  return (
    <section id="quality" className="relative overflow-hidden py-20 lg:py-28 bg-steel">
      <div className="absolute inset-0 bg-industrial-grid opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead
          eyebrow={t.quality.eyebrow}
          title={t.quality.title}
          subtitle={t.quality.subtitle}
          dark
        />

        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="reveal order-2 lg:order-1 space-y-4">
            {t.quality.points.map((p, idx) => (
              <div
                key={p.title}
                className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-colors hover:bg-white/10"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-sky-400" />
                <div>
                  <h3 className="font-bold text-white">{p.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-300">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="reveal order-1 lg:order-2">
            <div className="overflow-hidden rounded-2xl shadow-2xl shadow-black/40 ring-1 ring-white/15">
              <img
                src="/assets/quality.jpg"
                alt={t.quality.imgAlt}
                loading="lazy"
                className="aspect-[3/2] w-full object-cover"
              />
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {t.quality.certs.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-1.5 text-sm font-semibold text-sky-300"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
