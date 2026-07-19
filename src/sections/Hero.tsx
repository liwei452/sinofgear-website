import { ShieldCheck, ArrowRight, Mail, Clock3, Layers, Award, Globe2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLang } from '@/i18n/LanguageContext'
import { scrollToId } from './Header'

const chipIcons = [Clock3, Layers, Award, Globe2]

export default function Hero() {
  const { t } = useLang()
  const stats = [t.stats.years, t.stats.parts, t.stats.machines, t.stats.ontime]

  return (
    <section className="relative overflow-hidden bg-steel">
      {/* background image + overlays */}
      <div className="absolute inset-0">
        <img
          src="/assets/hero.jpg"
          alt=""
          className="h-full w-full object-cover opacity-45"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(213,45%,10%)] via-[hsl(213,45%,10%)/0.82] to-[hsl(207,60%,20%)/0.45]" />
        <div className="absolute inset-0 bg-industrial-grid opacity-60" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[92vh] flex-col justify-center pt-28 pb-16 lg:pt-32">
          <div className="max-w-3xl">
            <div className="reveal is-visible inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs sm:text-sm font-medium text-sky-200 backdrop-blur-sm">
              <ShieldCheck className="h-4 w-4 text-sky-300" />
              {t.hero.badge}
            </div>

            <h1 className="reveal is-visible mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight text-white text-balance">
              {t.hero.titleA}
              <br />
              <span className="text-sky-400">{t.hero.titleB}</span>
            </h1>

            <p className="reveal is-visible mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-300">
              {t.hero.subtitle}
            </p>

            <div className="reveal is-visible mt-8 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="gap-2 bg-sky-500 hover:bg-sky-400 text-white font-bold shadow-lg shadow-sky-900/40 h-12 px-6 text-base"
                onClick={() => scrollToId('inquiry')}
              >
                <Mail className="h-5 w-5" />
                {t.hero.ctaQuote}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-6 text-base font-semibold border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white backdrop-blur-sm"
                onClick={() => scrollToId('capabilities')}
              >
                {t.hero.ctaCapabilities}
              </Button>
            </div>

            <ul className="reveal is-visible mt-8 flex flex-wrap gap-x-6 gap-y-2">
              {t.hero.chips.map((c, i) => {
                const Icon = chipIcons[i % chipIcons.length]
                return (
                  <li key={i} className="flex items-center gap-2 text-sm font-medium text-slate-200">
                    <Icon className="h-4 w-4 text-sky-400" />
                    {c}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* stats strip */}
      <div className="relative border-t border-white/10 bg-[hsl(213,45%,8%)/0.75] backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <dl className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/10">
            {stats.map((s, i) => (
              <div key={i} className="px-4 py-5 sm:px-8 text-center lg:text-left">
                <dt className="order-2 mt-1 text-xs sm:text-sm text-slate-400 leading-snug">{s.label}</dt>
                <dd className="text-2xl sm:text-3xl font-extrabold text-white">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
