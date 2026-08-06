import type { Lang } from '@/i18n/language'

export const companyFacts = {
  founded: '2008',
  facilityArea: 'Approximately 7,000 square meters',
  gearWorkshopArea: 'Approximately 4,000 square meters',
  beltWorkshopArea: 'Approximately 2,500 square meters',
  equipment: [
    'High-speed CNC gear hobbing machines',
    'CNC gear shaping machines',
    'Temperature-controlled gear grinding machines',
    'CNC machining centers',
  ],
  laboratory:
    'Class 100,000 temperature- and humidity-controlled precision gear inspection laboratory',
  gearAccuracy: 'Gear accuracy up to GB Grade 5',
  certification: 'ISO 9001 quality management system certification obtained in 2017',
  recognition:
    'High-tech enterprise and technology-based SME recognition obtained in 2020',
} as const

export const companyGallery = [
  {
    src: '/assets/factory-exterior.webp',
    alt: 'SINOF factory exterior at Building 16 in the Changsha bonded zone',
  },
  {
    src: '/assets/factory-showroom.webp',
    alt: 'SINOF company showroom and production information display area',
  },
  {
    src: '/assets/factory-production-floor.webp',
    alt: 'SINOF transmission manufacturing floor with organized CNC work areas',
  },
  {
    src: '/assets/factory-workshop.webp',
    alt: 'SINOF gear and transmission component production workshop in Changsha',
  },
] as const

export interface CompanyProfile {
  eyebrow: string
  title: string
  subtitle: string
  overviewTitle: string
  overview: string[]
  facts: Array<{ label: string; value: string }>
  equipmentTitle: string
  equipment: string[]
  qualityTitle: string
  quality: string[]
  productsTitle: string
  products: string[]
  ctaTitle: string
  ctaText: string
}

export const companyProfile: Record<Lang, CompanyProfile> = {
  en: {
    eyebrow: 'About SINOF',
    title: 'Transmission Manufacturing for Global Industry',
    subtitle:
      'Changsha Xingfeng Transmission Machinery Co., Ltd. manufactures gears, timing-drive components, and industrial belt products for drawing-led B2B projects.',
    overviewTitle: 'Built around transmission manufacturing',
    overview: [
      'Founded in 2008, SINOF supports industrial buyers with gear manufacturing, timing-drive products, and application-focused transmission solutions.',
      'Projects are reviewed against drawings, operating conditions, material requirements, quantities, inspection needs, and delivery documentation before quotation.',
    ],
    facts: [
      { label: 'Founded', value: companyFacts.founded },
      { label: 'Production facilities', value: companyFacts.facilityArea },
      { label: 'Gear workshop', value: companyFacts.gearWorkshopArea },
    ],
    equipmentTitle: 'Facilities and production equipment',
    equipment: [...companyFacts.equipment],
    qualityTitle: 'Quality and recognition',
    quality: [
      companyFacts.laboratory,
      companyFacts.gearAccuracy,
      companyFacts.certification,
      companyFacts.recognition,
    ],
    productsTitle: 'Product scope',
    products: [
      'Custom spur, helical, bevel, rack, and non-standard gear components',
      'Timing pulleys and matched timing-drive inquiries',
      'Rubber and polyurethane timing belts',
      'Conveyor belts, flat transmission belts, and round belts',
    ],
    ctaTitle: 'Discuss your transmission project',
    ctaText:
      'Send your drawing, quantity, material preference, and application details for technical and commercial review.',
  },
  zh: {
    eyebrow: '关于 SINOF',
    title: '面向全球工业的传动产品制造',
    subtitle:
      '长沙市星沣传动机械有限公司为以图纸和应用要求为基础的 B2B 项目提供齿轮、同步传动零件及工业带类产品。',
    overviewTitle: '专注传动产品制造',
    overview: [
      'SINOF 创立于 2008 年，为工业采购商提供齿轮制造、同步传动产品和面向具体应用的传动解决方案。',
      '报价前将结合图纸、工况、材料要求、数量、检测需求和交付文件进行项目评审。',
    ],
    facts: [
      { label: '成立时间', value: '2008 年' },
      { label: '标准生产厂房', value: '约 7,000 平方米' },
      { label: '齿轮生产车间', value: '约 4,000 平方米' },
    ],
    equipmentTitle: '厂房与生产设备',
    equipment: [
      '高速数控滚齿机',
      '数控插齿机',
      '恒温齿轮磨齿机',
      '数控加工中心',
    ],
    qualityTitle: '质量与荣誉',
    quality: [
      '十万级恒温恒湿精密齿轮检测实验室',
      '齿轮精度最高可达 GB 5 级',
      '2017 年通过 ISO 9001 质量管理体系认证',
      '2020 年获得高新技术企业和科技型中小企业认定',
    ],
    productsTitle: '产品范围',
    products: [
      '定制直齿轮、斜齿轮、锥齿轮、齿条及非标齿轮零件',
      '同步带轮及配套同步传动项目',
      '橡胶同步带和聚氨酯同步带',
      '输送带、平面传动带和圆带',
    ],
    ctaTitle: '沟通您的传动项目',
    ctaText: '请发送图纸、数量、材料偏好和应用详情，以便开展技术与商务评审。',
  },
  de: {
    eyebrow: 'Über SINOF',
    title: 'Antriebstechnik für die globale Industrie',
    subtitle:
      'Changsha Xingfeng Transmission Machinery Co., Ltd. fertigt Zahnräder, Synchronantriebskomponenten und Industriebänder für zeichnungsbasierte B2B-Projekte.',
    overviewTitle: 'Auf Antriebstechnik ausgerichtet',
    overview: [
      'SINOF wurde 2008 gegründet und unterstützt Industriekunden mit Zahnradfertigung, Synchronantrieben und anwendungsbezogenen Antriebslösungen.',
      'Vor dem Angebot prüfen wir Zeichnungen, Betriebsbedingungen, Werkstoffe, Mengen, Prüfanforderungen und Lieferdokumente.',
    ],
    facts: [
      { label: 'Gegründet', value: '2008' },
      { label: 'Produktionsfläche', value: 'Etwa 7.000 Quadratmeter' },
      { label: 'Zahnradwerkstatt', value: 'Etwa 4.000 Quadratmeter' },
    ],
    equipmentTitle: 'Fertigung und Ausrüstung',
    equipment: [
      'Hochgeschwindigkeits-CNC-Wälzfräsmaschinen',
      'CNC-Stoßmaschinen',
      'Temperaturgeregelte Zahnradschleifmaschinen',
      'CNC-Bearbeitungszentren',
    ],
    qualityTitle: 'Qualität und Anerkennungen',
    quality: [
      'Präzisionslabor der Reinheitsklasse 100.000 mit Temperatur- und Feuchteregelung',
      'Zahnradgenauigkeit bis GB-Klasse 5',
      'ISO-9001-Qualitätsmanagementzertifizierung im Jahr 2017',
      'Anerkennung als Hightech-Unternehmen und technologieorientiertes KMU im Jahr 2020',
    ],
    productsTitle: 'Produktspektrum',
    products: [
      'Kundenspezifische Stirn-, Schräg- und Kegelräder, Zahnstangen und Sonderteile',
      'Zahnriemenscheiben und abgestimmte Synchronantriebe',
      'Zahnriemen aus Gummi und Polyurethan',
      'Förderbänder, Flachriemen und Rundriemen',
    ],
    ctaTitle: 'Besprechen Sie Ihr Antriebsprojekt',
    ctaText:
      'Senden Sie Zeichnung, Menge, Werkstoffwunsch und Anwendungsdaten zur technischen und kaufmännischen Prüfung.',
  },
  ja: {
    eyebrow: 'SINOFについて',
    title: '世界の産業を支える伝動製品製造',
    subtitle:
      'Changsha Xingfeng Transmission Machinery Co., Ltd.は、図面を基にしたB2B案件向けに歯車、同期伝動部品、産業用ベルトを製造しています。',
    overviewTitle: '伝動製品製造を中心に',
    overview: [
      'SINOFは2008年に設立され、歯車製造、同期伝動製品、用途に応じた伝動ソリューションを産業バイヤーに提供しています。',
      '見積もり前に、図面、使用条件、材料、数量、検査要件、納入文書を確認します。',
    ],
    facts: [
      { label: '設立', value: '2008年' },
      { label: '生産施設', value: '約7,000平方メートル' },
      { label: '歯車工場', value: '約4,000平方メートル' },
    ],
    equipmentTitle: '設備と生産機械',
    equipment: [
      '高速CNC歯切り盤',
      'CNC歯車形削り盤',
      '恒温歯車研削盤',
      'CNCマシニングセンター',
    ],
    qualityTitle: '品質と認定',
    quality: [
      'クラス100,000の恒温恒湿精密歯車検査ラボ',
      '歯車精度は最高GB 5級',
      '2017年にISO 9001品質マネジメントシステム認証を取得',
      '2020年にハイテク企業および技術系中小企業として認定',
    ],
    productsTitle: '製品範囲',
    products: [
      'カスタム平歯車、はすば歯車、かさ歯車、ラック、非標準歯車部品',
      'タイミングプーリーおよび同期伝動案件',
      'ゴムおよびポリウレタン製タイミングベルト',
      'コンベヤベルト、平ベルト、丸ベルト',
    ],
    ctaTitle: '伝動プロジェクトをご相談ください',
    ctaText: '図面、数量、希望材料、用途情報をお送りいただければ、技術・商務面から確認します。',
  },
  es: {
    eyebrow: 'Acerca de SINOF',
    title: 'Fabricación de transmisión para la industria global',
    subtitle:
      'Changsha Xingfeng Transmission Machinery Co., Ltd. fabrica engranajes, componentes de transmisión síncrona y bandas industriales para proyectos B2B basados en planos.',
    overviewTitle: 'Especialistas en fabricación de transmisión',
    overview: [
      'Fundada en 2008, SINOF suministra fabricación de engranajes, productos de transmisión síncrona y soluciones adaptadas a cada aplicación industrial.',
      'Antes de cotizar revisamos planos, condiciones de trabajo, materiales, cantidades, inspección y documentación de entrega.',
    ],
    facts: [
      { label: 'Fundación', value: '2008' },
      { label: 'Instalaciones productivas', value: 'Aproximadamente 7.000 metros cuadrados' },
      { label: 'Taller de engranajes', value: 'Aproximadamente 4.000 metros cuadrados' },
    ],
    equipmentTitle: 'Instalaciones y equipos',
    equipment: [
      'Talladoras de engranajes CNC de alta velocidad',
      'Mortajadoras de engranajes CNC',
      'Rectificadoras de engranajes con temperatura controlada',
      'Centros de mecanizado CNC',
    ],
    qualityTitle: 'Calidad y reconocimientos',
    quality: [
      'Laboratorio de inspección de engranajes de clase 100.000 con temperatura y humedad controladas',
      'Precisión de engranajes hasta grado GB 5',
      'Certificación del sistema de gestión de calidad ISO 9001 obtenida en 2017',
      'Reconocimiento como empresa de alta tecnología y pyme tecnológica obtenido en 2020',
    ],
    productsTitle: 'Gama de productos',
    products: [
      'Engranajes rectos, helicoidales y cónicos, cremalleras y piezas especiales',
      'Poleas dentadas y proyectos de transmisión síncrona',
      'Correas dentadas de caucho y poliuretano',
      'Bandas transportadoras, correas planas y correas redondas',
    ],
    ctaTitle: 'Hablemos de su proyecto de transmisión',
    ctaText:
      'Envíe su plano, cantidad, material preferido y datos de aplicación para revisión técnica y comercial.',
  },
}
