import { Mail } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useLang } from '@/i18n/LanguageContext'
import { scrollToId } from './Header'
import SectionHead from './SectionHead'

interface Props {
  onInquire: (productId: string) => void
}

export default function Products({ onInquire }: Props) {
  const { t } = useLang()

  return (
    <section id="products" className="py-20 lg:py-28 bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead eyebrow={t.products.eyebrow} title={t.products.title} subtitle={t.products.subtitle} />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {t.products.items.map((p, idx) => (
            <article
              key={p.id}
              className="reveal group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10"
              style={{ animationDelay: `${(idx % 3) * 90}ms` }}
            >
              <div className="relative aspect-[3/2] overflow-hidden">
                <img
                  src={p.img}
                  alt={p.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
              </div>

              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  {p.name}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.specs.map((s) => (
                    <Badge key={s} variant="secondary" className="text-[11px] font-semibold">
                      {s}
                    </Badge>
                  ))}
                </div>

                <Button
                  variant="outline"
                  className="mt-5 w-full gap-2 border-primary/30 font-semibold text-primary hover:bg-primary hover:text-white"
                  onClick={() => {
                    onInquire(p.id)
                    scrollToId('inquiry')
                  }}
                >
                  <Mail className="h-4 w-4" />
                  {t.products.inquire}
                </Button>
              </div>
            </article>
          ))}
        </div>

        <p className="reveal mt-10 text-center">
          <button
            onClick={() => scrollToId('inquiry')}
            className="text-sm font-semibold text-primary hover:underline underline-offset-4"
          >
            {t.products.viewAll}
          </button>
        </p>
      </div>
    </section>
  )
}
