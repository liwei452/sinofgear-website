import { BookOpenCheck, Boxes, FileCheck2, Mail, Ruler, ScanLine, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router'
import PageHero from '@/components/PageHero'
import Seo from '@/components/Seo'
import { Button } from '@/components/ui/button'
import { pages } from '@/data/pages'

const qualityTopics = [
  {
    icon: FileCheck2,
    title: 'Controlled drawing',
    description: 'Part revision, units, tolerances, notes, and referenced specifications form the acceptance baseline.',
  },
  {
    icon: Ruler,
    title: 'Critical characteristics',
    description: 'Functional dimensions and gear characteristics are identified before the inspection scope is agreed.',
  },
  {
    icon: ScanLine,
    title: 'Measurement method',
    description: 'Datum strategy, method, equipment suitability, and report format are aligned with the stated requirement.',
  },
  {
    icon: BookOpenCheck,
    title: 'Document package',
    description: 'Material, heat-treatment, dimensional, or gear reports are supplied only when included in the order scope.',
  },
  {
    icon: ShieldCheck,
    title: 'Change control',
    description: 'Material substitutions, drawing deviations, and process changes require an agreed review and disposition.',
  },
  {
    icon: Boxes,
    title: 'Identification and packing',
    description: 'Part marking, batch identification, preservation, and packing requirements are defined for the project.',
  },
]

export default function QualityPage() {
  return (
    <>
      <Seo seo={pages.quality.seo} pathname="/quality" image="/assets/quality.jpg" />
      <PageHero
        eyebrow={pages.quality.eyebrow}
        title={pages.quality.title}
        subtitle={pages.quality.subtitle}
        compact
      />

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <img
              src="/assets/quality.jpg"
              alt="Gear inspection setup used as a visual reference"
              className="aspect-[4/3] w-full rounded-3xl object-cover shadow-xl"
            />
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Before production</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Inspection Planning</h2>
              <p className="mt-5 text-sm leading-7 text-muted-foreground">
                Inspection is meaningful only when the drawing, functional datums, measurable characteristics, methods, and reporting expectations are aligned.
              </p>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                Specific inspection equipment, sampling levels, precision grades, and certificates are confirmed during technical and commercial review.
              </p>
            </div>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {qualityTopics.map((topic) => (
              <article key={topic.title} className="rounded-2xl border bg-white p-6 shadow-sm">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary">
                  <topic.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-bold">{topic.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{topic.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-steel py-16 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 px-4 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">Define the quality package in your RFQ</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              Mark critical characteristics and list the records your team needs so they can be reviewed as part of the quotation.
            </p>
          </div>
          <Button asChild size="lg" className="shrink-0 gap-2 bg-sky-500 font-bold hover:bg-sky-400">
            <Link to="/contact">
              <Mail className="h-5 w-5" />
              Request a Quote
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
