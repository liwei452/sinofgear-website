import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useLang } from '@/i18n/LanguageContext'
import SectionHead from './SectionHead'

export default function Faq() {
  const { t } = useLang()

  return (
    <section id="faq" className="py-20 lg:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHead eyebrow={t.faq.eyebrow} title={t.faq.title} />

        <div className="reveal">
          <Accordion type="single" collapsible className="space-y-3">
            {t.faq.items.map((f, idx) => (
              <AccordionItem
                key={idx}
                value={`item-${idx}`}
                className="rounded-xl border bg-card px-5 shadow-sm data-[state=open]:border-primary/40 data-[state=open]:shadow-md"
              >
                <AccordionTrigger className="py-5 text-left text-[15px] font-bold hover:no-underline hover:text-primary">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
