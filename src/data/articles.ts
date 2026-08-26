export type { Article, ArticleBlock, ArticleSection } from './articleTypes'
import type { Article } from './articleTypes'
import { generatedArticles, mergeArticles } from './generatedArticles'

const commonMeta = {
  publishedAt: '2026-08-06',
  updatedAt: '2026-08-06',
  author: 'SINOF Engineering Team' as const,
}

const legacyArticles: Article[] = [
  {
    ...commonMeta,
    slug: 'what-information-is-needed-for-custom-gear-rfq',
    title: 'What Information Is Needed for a Custom Gear RFQ?',
    description:
      'Use this practical custom gear RFQ checklist to prepare drawings, geometry, material, heat treatment, quantity, inspection, and application data.',
    excerpt:
      'A complete RFQ helps engineering teams review feasibility, choose a manufacturing route, and quote the same technical scope that the buyer expects to receive.',
    topic: 'RFQ Preparation',
    readingMinutes: 7,
    heroImage: '/assets/gear-spur.jpg',
    heroImageAlt: 'Precision-machined spur gear used for a custom gear RFQ review',
    relatedProductSlugs: ['custom-gears', 'spur-gears', 'helical-gears'],
    sections: [
      {
        id: 'why-complete-rfq-matters',
        title: 'Why a complete RFQ matters',
        blocks: [
          {
            type: 'paragraph',
            text: 'A gear quotation is a technical agreement in progress. Tooth geometry alone is not enough to select material, heat treatment, tooling, finishing, inspection, packaging, or a realistic production route. Missing information creates assumptions, and different assumptions make supplier quotations difficult to compare.',
          },
          {
            type: 'note',
            title: 'Best starting package',
            text: 'Send a dimensioned PDF drawing, a STEP model when available, the expected order quantity, and a short description of the application. Final capability and acceptance criteria remain subject to drawing review.',
          },
        ],
      },
      {
        id: 'technical-data-checklist',
        title: 'Technical data checklist',
        blocks: [
          {
            type: 'table',
            headers: ['Information', 'What to provide', 'Why it affects the quotation'],
            rows: [
              ['Gear geometry', 'Gear type, module or DP, tooth count, pressure angle, helix data, profile shift', 'Defines the tooth system, tooling, mating conditions, and measurement method'],
              ['Blank and interfaces', 'Outside dimensions, bore, hub, keyway, spline, thread, datum features', 'Defines turning, milling, broaching, grinding, and setup requirements'],
              ['Material', 'Exact grade and permitted equivalents', 'Affects availability, machining, heat treatment, distortion, and certification'],
              ['Heat treatment', 'Process, case depth, core hardness, final hardness, areas to mask', 'Affects process sequence, stock allowance, distortion control, and testing'],
              ['Accuracy', 'Applicable standard, grade, backlash, runout, profile and lead requirements', 'Defines finishing and gear-inspection scope'],
              ['Quantity', 'Prototype quantity, annual demand, batch size, and schedule', 'Changes tooling, process planning, and unit economics'],
              ['Documentation', 'Material certificate, hardness report, dimensional report, gear chart, traceability', 'Defines inspection time and record-retention requirements'],
            ],
          },
        ],
      },
      {
        id: 'application-and-commercial-context',
        title: 'Application and commercial context',
        blocks: [
          {
            type: 'paragraph',
            text: 'Application data helps the supplier identify conflicts that a drawing may not reveal. Share speed, torque, duty cycle, lubrication, temperature, shock load, noise expectations, mating components, installation constraints, and whether the gear is safety-critical. The buyer retains design authority, while the manufacturer can provide manufacturability observations.',
          },
          {
            type: 'list',
            style: 'bullet',
            items: [
              'Separate prototype, first-article, and production quantities.',
              'State the delivery location and Incoterm requested for commercial comparison.',
              'Identify controlled or customer-supplied material requirements.',
              'List inspection characteristics that require measured values rather than pass/fail confirmation.',
              'Attach the latest drawing revision and explain any open technical questions.',
            ],
          },
        ],
      },
      {
        id: 'before-you-send',
        title: 'Before you send the RFQ',
        blocks: [
          {
            type: 'list',
            style: 'number',
            items: [
              'Check that the 2D drawing and 3D model show the same revision.',
              'Mark critical characteristics and define their datums.',
              'Remove conflicting general and feature-specific tolerances.',
              'Confirm units, quantity, material, heat treatment, and reporting needs.',
              'Ask the supplier to identify assumptions and exceptions in the quotation.',
            ],
          },
          {
            type: 'paragraph',
            text: 'If some values are unknown, say so explicitly. An engineering review can then focus on the missing decisions instead of treating silence as approval for a supplier assumption.',
          },
        ],
      },
    ],
    faq: [
      {
        question: 'Is a 3D model enough for a custom gear quotation?',
        answer: 'A 3D model helps with geometry, but a controlled 2D drawing is still recommended for tolerances, material, heat treatment, surface finish, inspection, and revision requirements.',
      },
      {
        question: 'Can a physical sample be used when no drawing exists?',
        answer: 'A sample can support an initial review, but wear and damage may hide the original geometry. Production should follow mutually agreed drawings and acceptance criteria.',
      },
      {
        question: 'Should prototype and production quantities be quoted together?',
        answer: 'Yes. Separate quantities let the supplier explain prototype setup costs and propose a different production process or tooling strategy for repeat demand.',
      },
    ],
  },
  {
    ...commonMeta,
    slug: 'spur-gear-vs-helical-gear',
    title: 'Spur Gear vs Helical Gear: How to Choose',
    description:
      'Compare spur and helical gears by load sharing, noise, efficiency, axial force, speed, cost drivers, and application constraints before design review.',
    excerpt:
      'Spur gears are simple and efficient, while helical gears offer smoother tooth engagement. The right choice depends on the complete transmission, not one advantage alone.',
    topic: 'Gear Selection',
    readingMinutes: 7,
    heroImage: '/assets/gear-helical.jpg',
    heroImageAlt: 'Close-up comparison context for helical and spur gear tooth forms',
    relatedProductSlugs: ['spur-gears', 'helical-gears', 'custom-gears'],
    sections: [
      {
        id: 'fundamental-difference',
        title: 'The fundamental difference',
        blocks: [
          {
            type: 'paragraph',
            text: 'Spur gear teeth are parallel to the shaft axis. Helical teeth are cut at an angle, so contact begins progressively and more than one tooth pair may share load during part of the mesh. That geometry influences noise, load distribution, bearing reactions, manufacturing, and inspection.',
          },
        ],
      },
      {
        id: 'comparison',
        title: 'Spur and helical gear comparison',
        blocks: [
          {
            type: 'table',
            headers: ['Decision factor', 'Spur gear', 'Helical gear'],
            rows: [
              ['Tooth engagement', 'Engages across the tooth width more directly', 'Engages progressively along the tooth'],
              ['Noise and vibration', 'Can be more noticeable as pitch-line speed rises', 'Often smoother when alignment and quality are controlled'],
              ['Axial force', 'Normally no mesh-generated axial thrust', 'Produces axial thrust that bearings and housing must support'],
              ['Efficiency', 'Generally high with straightforward sliding conditions', 'Can have more sliding and related heat generation'],
              ['Load sharing', 'Depends strongly on face contact and alignment', 'Overlap can increase contact ratio and smooth load transfer'],
              ['Manufacturing inputs', 'Tooth system and blank geometry are comparatively direct', 'Requires helix angle, hand, and normal/transverse conventions to be unambiguous'],
              ['Typical selection pressure', 'Simplicity, efficiency, low axial load, compact cost target', 'Noise, smoothness, speed, and load-sharing target'],
            ],
          },
        ],
      },
      {
        id: 'system-level-questions',
        title: 'Questions to answer at system level',
        blocks: [
          {
            type: 'list',
            style: 'bullet',
            items: [
              'What torque, speed, duty cycle, shock load, and service life must the stage support?',
              'How much noise is acceptable at the operating pitch-line speed?',
              'Can the shaft, bearings, and housing support helical axial thrust in both operating directions?',
              'What center distance, ratio, face width, and envelope are available?',
              'How will lubrication, temperature, alignment, and housing stiffness be controlled?',
              'Which accuracy standard, backlash target, and inspection records apply?',
            ],
          },
          {
            type: 'note',
            title: 'Direction matters',
            text: 'For helical pairs, state the helix angle, hand, and whether the shafts are parallel or crossed. Include both mating gears in the drawing review.',
          },
        ],
      },
      {
        id: 'selection-guidance',
        title: 'Practical selection guidance',
        blocks: [
          {
            type: 'paragraph',
            text: 'Choose a spur arrangement when simplicity, efficiency, minimal axial force, and direct manufacturability dominate. Consider a helical arrangement when smoother engagement, lower noise, or additional contact ratio justifies the axial-load and sliding consequences. In either case, tooth modifications, alignment, material, heat treatment, lubrication, and gear accuracy can matter as much as the tooth direction.',
          },
          {
            type: 'paragraph',
            text: 'A supplier should not select the final geometry from a short application label. Submit the duty data and mating components for engineering review before freezing the drawing.',
          },
        ],
      },
    ],
    faq: [
      {
        question: 'Are helical gears always quieter than spur gears?',
        answer: 'Not always. Progressive engagement can reduce excitation, but accuracy, alignment, modifications, housing stiffness, lubrication, load, and speed also control noise.',
      },
      {
        question: 'Why do helical gears create axial thrust?',
        answer: 'The angled tooth force has an axial component. Its direction depends on helix hand and rotation, so bearings and housing must be designed for the resulting thrust.',
      },
      {
        question: 'Can a spur gear be replaced by a helical gear without redesigning the gearbox?',
        answer: 'Usually not as a direct substitution. Shaft forces, bearing arrangement, tooth geometry, center distance, backlash, face width, and mating components require a system-level review.',
      },
    ],
  },
  {
    ...commonMeta,
    slug: 'iso-1328-gbt-10095-gear-accuracy-grades',
    title: 'ISO 1328 and GB/T 10095 Gear Accuracy Grades Explained',
    description:
      'Understand what ISO 1328-1 and GB/T 10095.1 gear accuracy grades describe, how grade numbers work, and what buyers should define for inspection.',
    excerpt:
      'A gear accuracy grade is not a complete performance specification. Buyers and suppliers still need to agree the edition, characteristics, measurement method, and acceptance records.',
    topic: 'Quality & Inspection',
    readingMinutes: 8,
    heroImage: '/assets/quality.jpg',
    heroImageAlt: 'Gear inspection equipment used to evaluate accuracy characteristics',
    relatedProductSlugs: ['custom-gears', 'spur-gears', 'helical-gears'],
    sections: [
      {
        id: 'what-grades-describe',
        title: 'What a gear accuracy grade describes',
        blocks: [
          {
            type: 'paragraph',
            text: 'ISO 1328-1 and the corresponding GB/T 10095.1 framework classify deviations for cylindrical involute gears. Depending on the specified standard and edition, evaluation may cover pitch, profile, helix, and related accuracy characteristics. The grade communicates allowable deviation limits for defined geometry and measurement conditions.',
          },
          {
            type: 'note',
            title: 'Grade direction',
            text: 'Within these grading systems, a lower grade number generally represents tighter accuracy requirements. Always cite the full standard designation and edition on the drawing rather than writing only “Grade 6.”',
          },
        ],
      },
      {
        id: 'grade-is-not-complete-specification',
        title: 'Why the grade is not a complete specification',
        blocks: [
          {
            type: 'table',
            headers: ['Drawing decision', 'Why it still needs definition'],
            rows: [
              ['Standard and edition', 'Limits and terminology must be interpreted against the intended published document'],
              ['Characteristics to inspect', 'Not every order automatically requires a full profile, helix, and pitch report'],
              ['Measurement datum', 'Bore, centers, faces, and tooth datum relationships affect setup and runout results'],
              ['Inspection stage', 'Results before and after heat treatment or finishing may differ'],
              ['Reporting format', 'A certificate of conformance is different from a chart with measured values'],
              ['Backlash and tooth thickness', 'Functional assembly targets need their own limits and measurement conditions'],
              ['Mating conditions', 'Contact, alignment, housing, and lubrication influence gearbox performance beyond individual gear grade'],
            ],
          },
        ],
      },
      {
        id: 'how-to-specify',
        title: 'How buyers should specify gear accuracy',
        blocks: [
          {
            type: 'list',
            style: 'number',
            items: [
              'Name the standard and edition, such as ISO 1328-1:2013 or the intended GB/T 10095.1 edition.',
              'State the target grade and identify which characteristics require verification.',
              'Define tooth thickness or backlash requirements separately where needed.',
              'Show inspection datums and any runout relationship to the bore or shaft centers.',
              'State whether measured reports, charts, material certificates, and hardness records are required.',
              'Agree how nonconforming results, measurement uncertainty, and reinspection will be handled.',
            ],
          },
        ],
      },
      {
        id: 'supplier-review',
        title: 'What to confirm with the supplier',
        blocks: [
          {
            type: 'paragraph',
            text: 'Ask which characteristics can be measured in-house, which require an external laboratory, and whether the proposed manufacturing route supports the requested grade after heat treatment and finishing. Confirm the instrument type, report format, sampling plan, and whether every piece or a sample is inspected.',
          },
          {
            type: 'paragraph',
            text: 'SINOF reviews GB/T and ISO accuracy targets against the drawing, material, heat treatment, size, quantity, and inspection scope. A target such as GB/T 10095.1 or ISO 1328-1 Grade 5–6 is not a universal promise; acceptance is confirmed only after engineering and drawing review.',
          },
        ],
      },
    ],
    faq: [
      {
        question: 'Does a lower ISO 1328 grade number mean higher accuracy?',
        answer: 'Generally yes within the ISO 1328 grading framework. The exact allowable deviations still depend on the gear geometry, characteristic, and cited standard edition.',
      },
      {
        question: 'Is gear accuracy grade the same as backlash?',
        answer: 'No. Accuracy grades classify specified deviations, while backlash is an assembly and tooth-thickness relationship that must be defined for the intended mating conditions.',
      },
      {
        question: 'Should every production gear receive a full gear chart?',
        answer: 'That depends on risk, quantity, process capability, and contract requirements. Agree the characteristics, sampling frequency, and report format during quotation.',
      },
    ],
  },
  {
    ...commonMeta,
    slug: 'custom-gear-materials-heat-treatment',
    title: 'Custom Gear Materials and Heat Treatment Options',
    description:
      'Compare common custom gear materials and heat treatments by strength, wear, distortion, corrosion, machinability, and inspection requirements.',
    excerpt:
      'Material and heat treatment must be selected together. Load, wear, impact, environment, section size, distortion risk, finishing, and documentation all affect the route.',
    topic: 'Materials & Processes',
    readingMinutes: 9,
    heroImage: '/assets/gear-shaft.jpg',
    heroImageAlt: 'Machined steel gear shaft illustrating material and heat-treatment decisions',
    relatedProductSlugs: ['custom-gears', 'spur-gears', 'helical-gears'],
    sections: [
      {
        id: 'selection-starts-with-duty',
        title: 'Selection starts with the duty',
        blocks: [
          {
            type: 'paragraph',
            text: 'The best material is not simply the hardest available grade. A gear must balance tooth-root strength, surface durability, toughness, dimensional stability, corrosion resistance, machinability, availability, inspection, and cost. Operating torque, speed, shock, duty cycle, lubrication, temperature, environment, and target life should guide the decision.',
          },
        ],
      },
      {
        id: 'material-comparison',
        title: 'Common gear material families',
        blocks: [
          {
            type: 'table',
            headers: ['Material family', 'Potential advantages', 'Review points'],
            rows: [
              ['Medium-carbon steel', 'Availability, machinability, through-hardening options', 'Section response, toughness, final hardness, distortion'],
              ['Alloy steel', 'Hardenability and strength options for demanding duty', 'Exact grade, heat-treatment route, certification, finishing stock'],
              ['Carburizing steel', 'Hard wear-resistant case with tougher core potential', 'Case depth, surface carbon, distortion, grinding allowance, retained austenite requirements'],
              ['Nitriding steel', 'Hard case with relatively low process temperature', 'Material compatibility, compound layer, case depth, pre-treatment, edge condition'],
              ['Stainless steel', 'Corrosion resistance for suitable environments', 'Grade-specific strength, galling, heat treatment, magnetic and surface requirements'],
              ['Bronze or brass', 'Compatibility, corrosion behavior, and sliding applications', 'Strength, wear pairing, lubrication, alloy availability'],
              ['Engineering plastic', 'Low mass, corrosion resistance, low-noise potential', 'Temperature, moisture, creep, load, tolerances, molding or machining method'],
            ],
          },
        ],
      },
      {
        id: 'heat-treatment-routes',
        title: 'Common heat-treatment routes',
        blocks: [
          {
            type: 'subheading',
            id: 'through-hardening',
            title: 'Through hardening',
          },
          {
            type: 'paragraph',
            text: 'Through hardening can raise strength and hardness throughout suitable sections. Review section size, quench response, toughness, distortion, and whether teeth will be finished after treatment.',
          },
          {
            type: 'subheading',
            id: 'case-hardening',
            title: 'Carburizing and case hardening',
          },
          {
            type: 'paragraph',
            text: 'Carburizing can combine a hard wear-resistant surface with a tougher core, but it adds process time and distortion risk. Define effective case depth, surface and core hardness, test location, and post-treatment finishing.',
          },
          {
            type: 'subheading',
            id: 'nitriding-induction',
            title: 'Nitriding and induction hardening',
          },
          {
            type: 'paragraph',
            text: 'Nitriding offers a hard surface at relatively low process temperature for compatible materials. Induction hardening selectively heats tooth regions and requires agreement on pattern, depth, hardness, transition zone, and verification method.',
          },
        ],
      },
      {
        id: 'drawing-and-inspection',
        title: 'Drawing and inspection requirements',
        blocks: [
          {
            type: 'list',
            style: 'bullet',
            items: [
              'Use an exact material designation and identify acceptable equivalents or prohibit substitution.',
              'Specify heat-treatment process, target hardness range, case depth definition, and test location.',
              'Mark surfaces that must remain soft or be protected from treatment.',
              'Define whether dimensions apply before or after heat treatment and finishing.',
              'Request material, furnace, hardness, microstructure, or case-depth records only where required.',
              'Agree straightening, grinding, shot blasting, coating, and corrosion-protection requirements.',
            ],
          },
          {
            type: 'note',
            title: 'Engineering review required',
            text: 'Material availability and heat-treatment capability vary by gear size, geometry, quantity, and required records. Confirm the complete route during drawing review before releasing production.',
          },
        ],
      },
    ],
    faq: [
      {
        question: 'Should material and heat treatment be quoted separately?',
        answer: 'They should be stated separately but reviewed together. Material composition and condition determine which heat treatments are suitable and how the part may distort.',
      },
      {
        question: 'Is the highest hardness always best for a gear?',
        answer: 'No. Excessive hardness or an unsuitable case can reduce toughness, complicate finishing, or create failure risk. The target should follow the duty and design calculation.',
      },
      {
        question: 'When should gear teeth be ground after heat treatment?',
        answer: 'Post-treatment grinding may be needed for accuracy, finish, or distortion correction, but the decision depends on geometry, grade, stock allowance, material, and cost targets.',
      },
    ],
  },
  {
    ...commonMeta,
    slug: 'prepare-gear-drawing-for-manufacturing',
    title: 'How to Prepare a Gear Drawing for Manufacturing Review',
    description:
      'Prepare a production-ready gear drawing with clear geometry, datums, tolerances, material, heat treatment, inspection, quantity, and revision control.',
    excerpt:
      'A useful gear drawing defines what must be manufactured and how conformity will be judged. Clear datums and inspection requirements prevent hidden assumptions.',
    topic: 'Drawing & DFM',
    readingMinutes: 8,
    heroImage: '/assets/factory.jpg',
    heroImageAlt: 'Gear manufacturing workshop where controlled drawings guide production',
    relatedProductSlugs: ['custom-gears', 'gear-racks', 'bevel-gears'],
    sections: [
      {
        id: 'drawing-package',
        title: 'Build a controlled drawing package',
        blocks: [
          {
            type: 'paragraph',
            text: 'A STEP model communicates shape, while a 2D drawing communicates engineering intent. Send both when possible and ensure they carry the same part number and revision. The drawing should remain the authority for tolerances, material, heat treatment, surface finish, inspection, marking, and documentation unless the purchase order states otherwise.',
          },
        ],
      },
      {
        id: 'drawing-checklist',
        title: 'Gear drawing checklist',
        blocks: [
          {
            type: 'table',
            headers: ['Drawing area', 'Information to define'],
            rows: [
              ['Identification', 'Part number, title, revision, units, projection, scale, and applicable standards'],
              ['Tooth geometry', 'Gear type, module or DP, tooth count, pressure angle, helix angle and hand, profile shift, reference dimensions'],
              ['Blank geometry', 'Outside dimensions, faces, shoulders, reliefs, radii, chamfers, threads, and undercuts'],
              ['Interfaces', 'Bore, keyway, spline, taper, shaft centers, mounting holes, and mating datums'],
              ['Tolerances', 'Size, form, orientation, position, runout, tooth thickness, backlash-related limits, and gear grade'],
              ['Material and treatment', 'Exact grade, supply condition, heat treatment, hardness, case depth, coating, and protected areas'],
              ['Inspection', 'Critical characteristics, sampling, report type, gear charts, material and hardness records'],
              ['Commercial production', 'Prototype and production quantities, marking, preservation, packaging, and traceability'],
            ],
          },
        ],
      },
      {
        id: 'datums-and-tolerances',
        title: 'Make datums and tolerances inspectable',
        blocks: [
          {
            type: 'paragraph',
            text: 'Datums should reflect how the gear locates and rotates in the assembly. If tooth runout is controlled to a bore, the bore form and its relationship to faces may also need limits. If the part runs between centers, show center requirements. Avoid dimension chains that create contradictory acceptance zones.',
          },
          {
            type: 'list',
            style: 'bullet',
            items: [
              'Distinguish reference dimensions from acceptance dimensions.',
              'State whether sharp edges are broken and define critical chamfers explicitly.',
              'Use surface-finish requirements only on functionally relevant areas.',
              'Avoid applying a tight general tolerance to every noncritical feature.',
              'Identify dimensions that must be achieved after heat treatment or coating.',
              'Define the gear accuracy standard and edition instead of using an isolated grade number.',
            ],
          },
        ],
      },
      {
        id: 'release-review',
        title: 'Release and supplier review',
        blocks: [
          {
            type: 'list',
            style: 'number',
            items: [
              'Confirm that drawing, model, specification, and purchase order use the same revision.',
              'Ask the supplier to list deviations, substitutions, and assumptions in writing.',
              'Resolve inspection method and report format before manufacturing begins.',
              'Record approved drawing changes through revision control rather than email-only instructions.',
              'Retain the approved first-article package as the reference for repeat orders.',
            ],
          },
          {
            type: 'note',
            title: 'Manufacturability is collaborative',
            text: 'The supplier can suggest process-friendly changes, but the buyer should approve every design change. Final feasibility and process selection are confirmed through engineering and drawing review.',
          },
        ],
      },
    ],
    faq: [
      {
        question: 'Should the 2D drawing or 3D model control?',
        answer: 'State the authority explicitly. A common approach is for the model to define nominal shape and the drawing to control tolerances, notes, materials, processes, and inspection.',
      },
      {
        question: 'What file formats are useful for a gear inquiry?',
        answer: 'A dimensioned PDF and STEP model are a strong combination. DXF or DWG may support 2D profiles, while native CAD can be discussed when necessary.',
      },
      {
        question: 'How should critical dimensions be identified?',
        answer: 'Use clear drawing symbols or a characteristic list, define the datum system, and state whether measured values or pass/fail confirmation are required.',
      },
    ],
  },
  {
    ...commonMeta,
    slug: 'custom-gear-prototype-to-production',
    title: 'Custom Gear Prototype to Production: A Practical Workflow',
    description:
      'Follow a controlled custom gear workflow from RFQ and DFM through prototype, first article, validation, production, inspection, and repeat orders.',
    excerpt:
      'Moving from one prototype to stable production requires controlled drawings, agreed inspection, approved changes, process records, and feedback from the real assembly.',
    topic: 'Production Planning',
    readingMinutes: 8,
    heroImage: '/assets/hero.jpg',
    heroImageAlt: 'Custom gear manufacturing workflow from prototype through production',
    relatedProductSlugs: ['custom-gears', 'spur-gears', 'helical-gears'],
    sections: [
      {
        id: 'workflow-overview',
        title: 'A controlled workflow reduces surprises',
        blocks: [
          {
            type: 'paragraph',
            text: 'A prototype proves more than whether a supplier can make one part. It should test the drawing, manufacturing route, inspection method, assembly interface, and communication process that will support production. The workflow must preserve what was learned rather than restarting from an undocumented sample.',
          },
        ],
      },
      {
        id: 'stages',
        title: 'Prototype-to-production stages',
        blocks: [
          {
            type: 'table',
            headers: ['Stage', 'Main decisions', 'Useful output'],
            rows: [
              ['RFQ and drawing review', 'Scope, assumptions, material, heat treatment, quantity, accuracy, records', 'Technical clarification list and quotation'],
              ['DFM and process planning', 'Blank route, tooth cutting, heat treatment, finishing, datum strategy, inspection', 'Approved manufacturing assumptions and process route'],
              ['Prototype or first article', 'Tooling approach, setup, special characteristics, report depth', 'Parts plus dimensional and gear-inspection evidence'],
              ['Buyer validation', 'Fit, backlash, contact, noise, temperature, load, life, assembly method', 'Approval, rejection, or controlled change request'],
              ['Production release', 'Batch size, sampling, traceability, packaging, delivery cadence', 'Released revision and production control plan'],
              ['Repeat orders', 'Revision status, process changes, quality history, demand changes', 'Consistent order package and improvement record'],
            ],
          },
        ],
      },
      {
        id: 'prototype-validation',
        title: 'Validate the part in the real system',
        blocks: [
          {
            type: 'list',
            style: 'bullet',
            items: [
              'Confirm part identity, revision, material, treatment, and inspection status before assembly.',
              'Measure installation conditions such as center distance, alignment, bearing clearance, and lubrication.',
              'Check backlash or tooth contact under defined conditions where relevant.',
              'Run agreed speed, load, direction, duty cycle, and temperature conditions.',
              'Record noise, vibration, wear, temperature, and failure observations with test context.',
              'Convert approved changes into a revised drawing and purchase specification.',
            ],
          },
          {
            type: 'note',
            title: 'Prototype approval is specific',
            text: 'Approval applies to the tested revision, process assumptions, and inspection scope. Changes to material, heat treatment, tooling, or critical processes should receive documented review.',
          },
        ],
      },
      {
        id: 'production-control',
        title: 'Prepare for repeatable production',
        blocks: [
          {
            type: 'paragraph',
            text: 'Before production, agree which characteristics are checked on every part, which use sampling, and which require periodic process verification. Define traceability, nonconformance communication, change notification, preservation, packaging, and retention of inspection records.',
          },
          {
            type: 'list',
            style: 'number',
            items: [
              'Freeze the approved drawing revision and order specification.',
              'Confirm production quantity, batch size, forecast, and delivery schedule.',
              'Agree the inspection plan and documents shipped with each lot.',
              'Approve packaging that protects teeth, finished surfaces, and corrosion-sensitive material.',
              'Require written approval for changes that may affect fit, function, or validation status.',
            ],
          },
          {
            type: 'paragraph',
            text: 'SINOF evaluates each prototype and production route against the submitted requirements. Capacity, accuracy, process, and documentation commitments are confirmed only after engineering review of the released drawing and order scope.',
          },
        ],
      },
    ],
    faq: [
      {
        question: 'Is a prototype made with the same process as production?',
        answer: 'Not necessarily. Prototype quantities may use different blanks, tooling, or setups. Ask the supplier to identify process differences that could affect production validation.',
      },
      {
        question: 'What should a first-article report include?',
        answer: 'It should match the agreed scope: part identity and revision, measured critical dimensions, specified gear characteristics, material or heat-treatment evidence, and recorded deviations.',
      },
      {
        question: 'When is a new first article needed?',
        answer: 'Consider it after design revision, material or process change, tooling replacement, long production interruption, supplier-site change, or another change that could affect validated characteristics.',
      },
    ],
  },
]

export const articles: Article[] = mergeArticles(legacyArticles, generatedArticles)

export const articleRoutes = articles.map(({ slug }) => `/blog/${slug}`)

export function getArticleBySlug(slug: string | undefined): Article | undefined {
  return articles.find((article) => article.slug === slug)
}

export function getRelatedArticles(article: Article, limit = 3): Article[] {
  const sameTopic = articles.filter(
    (candidate) => candidate.slug !== article.slug && candidate.topic === article.topic,
  )
  const otherTopics = articles.filter(
    (candidate) => candidate.slug !== article.slug && candidate.topic !== article.topic,
  )
  return [...sameTopic, ...otherTopics].slice(0, limit)
}
