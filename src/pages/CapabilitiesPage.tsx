import { ClipboardCheck, FileCog, Layers3, Mail, PackageCheck, ScanSearch, Wrench } from 'lucide-react'
import { Link } from 'react-router'
import PageHero from '@/components/PageHero'
import Seo from '@/components/Seo'
import { Button } from '@/components/ui/button'
import { pages } from '@/data/pages'

const reviewAreas = [
  {
    icon: FileCog,
    title: 'Drawing and model',
    description: 'Revision, units, datums, tolerances, tooth data, and any conflict between 2D and 3D files.',
  },
  {
    icon: Layers3,
    title: 'Material system',
    description: 'Base material, heat-treatment intent, hardness, coating, and substitution restrictions.',
  },
  {
    icon: Wrench,
    title: 'Manufacturing route',
    description: 'Blank preparation, tooth generation, secondary features, finishing, and process-dependent risks.',
  },
  {
    icon: ScanSearch,
    title: 'Inspection scope',
    description: 'Critical dimensions, gear characteristics, sampling, reports, and measurement references.',
  },
  {
    icon: ClipboardCheck,
    title: 'Order context',
    description: 'Prototype or production purpose, quantity, forecast, target date, and approval workflow.',
  },
  {
    icon: PackageCheck,
    title: 'Delivery requirements',
    description: 'Marking, preservation, packaging, traceability, and documents required with the shipment.',
  },
]

export default function CapabilitiesPage() {
  return (
    <>
      <Seo seo={pages.capabilities.seo} pathname="/capabilities" image="/assets/factory.jpg" />
      <PageHero
        eyebrow={pages.capabilities.eyebrow}
        title={pages.capabilities.title}
        subtitle={pages.capabilities.subtitle}
        compact
      />

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Project fit</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Technical Review Before Quotation</h2>
              <p className="mt-5 text-sm leading-7 text-muted-foreground">
                A product name alone is not enough to define a gear project. The review connects tooth geometry, the mating system, material condition, secondary features, inspection, and order context.
              </p>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                Capability, achievable accuracy, and process responsibility are confirmed for the submitted drawing rather than presented as unverified universal limits.
              </p>
            </div>
            <img
              src="/assets/factory.jpg"
              alt="Industrial machining environment used as a visual reference"
              className="aspect-[4/3] w-full rounded-3xl object-cover shadow-xl"
            />
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reviewAreas.map((area) => (
              <article key={area.title} className="rounded-2xl border bg-white p-6 shadow-sm">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary">
                  <area.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-bold">{area.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{area.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary/50 py-16 lg:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-steel p-7 text-white sm:p-10">
            <h2 className="text-2xl font-extrabold sm:text-3xl">What to include in your inquiry</h2>
            <div className="mt-6 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
              {[
                'Dimensioned drawing and available 3D model',
                'Product quantity and expected repeat demand',
                'Material and heat-treatment requirements',
                'Gear accuracy and critical tolerances',
                'Mating component or assembly information',
                'Inspection reports and document expectations',
              ].map((item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  {item}
                </div>
              ))}
            </div>
            <Button asChild size="lg" className="mt-8 gap-2 bg-sky-500 font-bold hover:bg-sky-400">
              <Link to="/contact">
                <Mail className="h-5 w-5" />
                Start an RFQ
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
