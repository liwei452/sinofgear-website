# SINOF Procurement-Led Website Redesign

## Objective

Redesign the existing SINOF website around the overseas industrial buyer's decision journey. The first screen must help a buyer decide whether SINOF is relevant, then move them through product fit, application fit, manufacturing evidence, quality planning, and drawing review.

This is a full visual and information-architecture overhaul on top of the existing content and routes. It is not a backend rewrite.

## Confirmed Direction

- Visual direction: precision industrial editorial.
- Scope: unified redesign across the public website.
- Primary conversion: submit a drawing for technical review.
- Primary offer: custom gears made to drawing.
- Secondary offer: timing-drive components and industrial belt products.
- Buyer perspective: organize information by procurement decisions, not internal company departments.

## Redesign Mode and Constraints

Mode: redesign overhaul with strict content, SEO, and integration preservation.

The redesign must preserve:

- Every existing public route and product slug.
- Existing SEO metadata generation, canonical URLs, structured data, and pre-rendering.
- Inquiry form field names, file upload behavior, API contracts, analytics events, and customer-service integration.
- Existing SINOF logo and legal identity.
- Existing multilingual behavior.
- Existing enterprise contact email `wei.li@sinofgears.com`.

The redesign may change navigation labels and hierarchy because the user explicitly requested a new information architecture. Existing destinations remain reachable at their current URLs.

## Buyer Journey

The site should communicate this sequence:

1. Confirm supplier fit: SINOF manufactures custom gears from controlled drawings.
2. Choose a route: browse by product family or by application need.
3. Verify manufacturing capability: understand equipment, materials, process review, and project-fit boundaries.
4. Verify quality planning: inspect measurable acceptance criteria, laboratory capability, documentation, and change control.
5. Understand the review process: know which inputs are needed and what happens before quotation.
6. Submit a drawing: send a controlled file and application context for technical review.

## Information Architecture

### Desktop navigation

- Products
  - Custom gears: spur, helical, bevel, worm, rack, non-standard gears.
  - Timing drive: timing pulleys, rubber timing belts, polyurethane timing belts.
  - Industrial belts: conveyor belts, flat belts, round belts.
- Applications
  - New custom gear projects.
  - Replacement gears.
  - Reverse engineering.
  - Representative industries: industrial machinery, automation, material handling, mining, cement, MRO.
- Manufacturing: existing `/capabilities` route.
- Quality: existing `/quality` route.
- Resources: existing `/blog` route.
- Company: existing `/about` route.
- Primary CTA: existing `/contact` route, labeled "Submit Drawing" or localized equivalent.

On mobile, the same hierarchy becomes an accordion sheet. No horizontal navigation or hidden overflow is allowed.

### Route preservation

No route is removed. The mega menu uses current product and industry landing URLs. New top-level navigation concepts do not require new routes in this phase.

## Homepage Structure

### 1. Buyer-selector hero

Asymmetric split layout. Copy occupies the left side and a precision gear image occupies the right side.

Visible content is limited to:

- One direct H1: custom gears built around the buyer's drawing.
- One short supporting paragraph.
- Primary CTA: submit drawing.
- Secondary CTA: explore product families.

Below the main copy, provide two clear paths: "Find by product" and "Find by application". These are navigation controls, not decorative cards.

The hero must fit within the first desktop viewport. Do not place decorative badges, trust pills, scrolling prompts, status dots, or an oversized wall of claims inside the hero.

### 2. Verified operating facts

A restrained evidence band displays only verified facts from current company data:

- Founded in 2008.
- Approximately 7,000 square meters of production facilities.
- Gear accuracy up to GB Grade 5.
- ISO 9001 quality management certification obtained in 2017.

Facts require precise qualifiers. No inflated or rounded marketing claims are introduced.

### 3. Product-family selector

Replace the twelve-card wall with three unequal product families:

- Custom gears as the dominant entry.
- Timing-drive components as the second entry.
- Industrial belts as the supporting entry.

Use representative real product imagery and direct product links. The full product index remains available.

### 4. Application paths

Show how buyers can enter through a purchasing problem:

- Produce from a controlled drawing.
- Replace a worn or damaged gear.
- Review a reverse-engineering project.

Each path links to an existing industry/need landing page or contact flow. Do not promise automatic reverse engineering or capabilities not supported by current evidence.

### 5. Manufacturing evidence

Use real facility imagery and verified equipment statements. The composition should pair one dominant workshop image with concise capability evidence. Avoid four equal gallery cards.

### 6. Quality and acceptance planning

Explain that precision claims are established through drawing review, measurable characteristics, agreed inspection scope, and documentation. Use the real quality image or laboratory imagery. This section links to `/quality`.

### 7. Drawing review workflow

Use three named actions without generic step numbering:

- Share the controlled requirement.
- Review geometry, material, and inspection needs.
- Confirm quotation scope and open questions.

End with the primary drawing-review CTA.

## Inner Page Templates

### Product index

Group products by purchasing family instead of one undifferentiated grid. The custom gear family appears first and receives more visual weight. Secondary and tertiary groups remain easy to scan.

### Product details

Keep current technical content, product schema, and FAQ. Recompose the first screen around product identity, application fit, and drawing submission. Use a quieter editorial rhythm with fewer boxed cards.

### Manufacturing and quality

Use shared bright page headers and evidence-led sections. Retire large dark gradient hero panels. Lists should use whitespace, typographic hierarchy, and selective dividers instead of repeated card containers.

### Company

Lead with the real legal company, production history, facilities, and equipment. Use verified facts and real factory images. Do not use generated imagery for company proof.

### Contact

The form remains the primary element. Supporting content explains what to submit, security expectations, and direct contact details. Form behavior and field order remain unchanged.

### Resources and industry pages

Apply the shared page header, typography, colors, and CTA language. No route or article content is removed.

## Visual System

### Design read

Precision industrial editorial for overseas engineers and procurement teams. The visual language is bright, controlled, evidence-led, and slightly asymmetric. It should feel more like a technical publication than a catalog template.

### Dials

- DESIGN_VARIANCE: 6/10. Offset compositions and unequal media proportions, with strict single-column mobile fallbacks.
- MOTION_INTENSITY: 3/10. Hover, focus, menu, and small reveal transitions only. No scroll hijacking or decorative loops.
- VISUAL_DENSITY: 5/10. Compact enough for technical buyers, with clear reading pauses.

### Theme

Use one light theme across the public website. Do not alternate entire sections between light and dark. Dark charcoal may appear in images or small anchored details, but not as full-page theme flips.

### Color

- Background: warm technical white.
- Surface: cool light gray-blue.
- Primary accent: one medical/engineering blue.
- Text: charcoal, not pure black.
- Borders: cool gray with low contrast.

The blue accent must be consistent for links, focus rings, selected navigation, and primary buttons.

### Type

Use the existing system stack in this phase for reliability, but recalibrate size, weight, line length, and tracking. Avoid oversized marketing headlines and excessive uppercase micro-labels. English H1 stays within two lines at desktop.

### Shapes and containers

Use one restrained radius scale. Avoid deeply rounded cards, pills used as decoration, card-within-card layouts, and equal three-card feature rows. Prefer open compositions, image crops, aligned text blocks, and selective 1px separators.

### Motion and accessibility

- Animate only opacity and transform.
- Honor `prefers-reduced-motion`.
- Preserve keyboard navigation and visible focus.
- Maintain WCAG AA contrast.
- Keep navigation on one desktop line and fully visible within the mobile menu.

## Image Strategy

### Real evidence only

The following must use current or newly supplied real photos:

- Factory exterior and workshop.
- Equipment and production processes.
- Inspection laboratory and measurement equipment.
- Certificates, reports, and packaging evidence.

### Generated imagery allowed

Generated imagery may be used only as non-evidentiary editorial support:

- A precision macro gear composition for the homepage hero.
- Neutral technical texture or drawing-inspired background details.
- Generic application context imagery when clearly not presented as a SINOF facility or delivered customer project.

Generated assets contain no logos, no claims, no text, no fake measurement readouts, and no watermark. They never appear under headings that imply factory proof.

## Content Rules

- Default experience remains English.
- Use direct procurement language and concrete verbs.
- Keep one CTA label per intent.
- Avoid claims that require unavailable proof.
- Avoid excessive eyebrows, pills, gradients, and generic marketing phrases.
- Do not use generated customer names, testimonials, logos, metrics, or certifications.
- Preserve existing product and SEO copy unless a change improves buyer clarity without altering meaning.

## Acceptance Criteria

- All current routes render and remain pre-renderable.
- Navigation reflects the buyer-centered hierarchy and works at 390px and 1440px.
- Homepage uses the seven-section decision journey above.
- The homepage no longer renders twelve equal product cards.
- Product index visibly groups the three purchasing families.
- Shared page heroes use the bright editorial system.
- Inquiry form and API behavior remain unchanged.
- Real and generated imagery are clearly separated by role.
- Existing analytics, SEO, i18n, and customer-service tests continue to pass.
- New navigation, product grouping, and homepage tests pass.
- Production build, lint, and full test suite pass.
