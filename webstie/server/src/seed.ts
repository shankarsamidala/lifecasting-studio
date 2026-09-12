import bcrypt from 'bcryptjs'
import { prisma } from './db.js'

type PriceTier = { label: string; price: number }
type SeedModel = {
  slug: string
  label: string
  code?: string
  group?: string
  price?: number
  strikePrice?: number
  priceFormula?: string
  ageTiers?: PriceTier[]
  sizeTiers?: PriceTier[]
  preservationNote?: string
}
type SeedCategory = {
  slug: string
  label: string
  filters?: { slug: string; label: string }[]
  models: SeedModel[]
  warranty?: string
  castingDelivery?: string[]
  finalDelivery?: string[]
  castingProcess?: string
  materials?: string[]
  preservation?: string[]
  showReviews?: boolean
}

const BABY_CASTING_DELIVERY = [
  'Book the slot and visit the studio for casting.',
  'We also provide door-step service up to 25KM with a service charge of ₹1,000.',
  'More than 25KMs, transport charges apply.',
]
const BABY_FINAL_DELIVERY = [
  'After the customer provides all the details like photos and baby details, it takes 3 to 4 weeks for product delivery.',
  'Final product delivery either collect from studio or book for porter.',
]
const NAME_TAGLINE_FINAL_DELIVERY = [
  'After the customer provides all the details like photos, name, tagline, it takes 3 to 4 weeks for product delivery.',
  'Final product delivery either collect from studio or book for porter.',
]
const BABY_CASTING_PROCESS =
  'The baby casting dealing with the baby is 5 minutes. The entire casting process depends on the baby co-operation and takes approx. 30 to 40 minutes.'
const BABY_MATERIALS = [
  'Baby skin safe material',
  'Completely organic and non-toxic',
  'Life of the casting will be long lasting',
]
const SKIN_SAFE_MATERIALS = [
  'Skin safe material',
  'Completely organic and non-toxic',
  'Life of the casting will be long lasting',
]
const RESIN_SIZE_TIERS: PriceTier[] = [
  { label: '9 inch x 12 inch', price: 5999 },
  { label: '12 inch x 16 inch', price: 6999 },
  { label: '14 inch x 16 inch', price: 7999 },
  { label: '14 inch x 18 inch', price: 8799 },
  { label: '16 inch x 18 inch', price: 8999 },
  { label: '18 inch x 24 inch', price: 14999 },
]
const RESIN_FINAL_DELIVERY = [
  'It will take 4 to 5 weeks for final product delivery.',
  'Final product delivery either collect from studio or book for porter.',
]

const CATALOG: SeedCategory[] = [
  {
    slug: 'baby-casting',
    label: 'Baby Casting',
    filters: [
      { slug: '2-casting', label: '2 Casting' },
      { slug: '4-casting', label: '4 Casting' },
    ],
    models: [
      {
        slug: '1-hand-1-feet-standard',
        label: '1 Hand + 1 Feet - Standard',
        code: 'LCS-1H1F-STD-001',
        group: '2-casting',
        ageTiers: [
          { label: '0 to 1 year', price: 6500 },
          { label: '1 year and above', price: 8500 },
        ],
      },
    ],
    warranty: '2 Years for casting color',
    castingDelivery: BABY_CASTING_DELIVERY,
    finalDelivery: BABY_FINAL_DELIVERY,
    castingProcess: BABY_CASTING_PROCESS,
    materials: BABY_MATERIALS,
    showReviews: true,
  },
  {
    slug: 'parent-with-baby',
    label: 'Parent with Baby',
    models: [
      {
        slug: '3-hands-display-box',
        label: '3 Hands - Display Box Model',
        code: 'Parentwithbaby-1',
        price: 8000,
        strikePrice: 8500,
      },
    ],
    warranty: '2 Years for casting color',
    castingDelivery: BABY_CASTING_DELIVERY,
    finalDelivery: BABY_FINAL_DELIVERY,
    castingProcess: BABY_CASTING_PROCESS,
    materials: BABY_MATERIALS,
  },
  {
    slug: 'couple-casting',
    label: 'Couple Casting',
    models: [
      {
        slug: '2-hands-display-box',
        label: '2 Hands - Display Box Model',
        code: 'LCS-2H-001',
        price: 6500,
        strikePrice: 7000,
      },
    ],
    warranty: '2 Years for casting color',
    castingDelivery: BABY_CASTING_DELIVERY,
    finalDelivery: NAME_TAGLINE_FINAL_DELIVERY,
    castingProcess: 'It will take 20 minutes for casting.',
    materials: SKIN_SAFE_MATERIALS,
  },
  {
    slug: 'sibling-casting',
    label: 'Sibling Casting',
    models: [
      { slug: '2-hands-display-box', label: '2 Hands - Display Box Model', code: 'sibling-1', price: 6500, strikePrice: 7000 },
      { slug: '2-hands-frame', label: '2 Hands - Frame Model', code: 'sibling-2', price: 8000, strikePrice: 8500 },
    ],
    warranty: '2 Years for casting color',
    castingDelivery: BABY_CASTING_DELIVERY,
    finalDelivery: BABY_FINAL_DELIVERY,
    castingProcess: BABY_CASTING_PROCESS,
    materials: BABY_MATERIALS,
  },
  {
    slug: 'aashirvaad-casting',
    label: 'Aashirvaad Casting',
    models: [
      { slug: '2-hands-display-box', label: '2 Hands - Display Box Model', code: 'aashirvad-1', price: 6500, strikePrice: 7000 },
      { slug: '2-hands-frame', label: '2 Hands - Frame Model', code: 'aashirvad-2', price: 8000, strikePrice: 8500 },
    ],
    warranty: '2 Years for casting color',
    castingDelivery: BABY_CASTING_DELIVERY,
    finalDelivery: NAME_TAGLINE_FINAL_DELIVERY,
    castingProcess: 'It will take 20 minutes for casting.',
    materials: SKIN_SAFE_MATERIALS,
  },
  {
    slug: 'family-casting',
    label: 'Family Casting',
    models: [
      { slug: '3-hands-display-box', label: '3 Hands - Display Box Model', code: 'familycasting-1', price: 8000, strikePrice: 8500 },
      { slug: '4-hands-frame', label: '4 Hands - Frame Model', code: 'familycasting-2', price: 12000, strikePrice: 14000 },
    ],
    warranty: '2 Years for casting color',
    castingDelivery: BABY_CASTING_DELIVERY,
    finalDelivery: BABY_FINAL_DELIVERY,
    castingProcess: BABY_CASTING_PROCESS,
    materials: BABY_MATERIALS,
  },
  {
    slug: 'pet-casting',
    label: 'Pet Casting',
    models: [
      { slug: '1-paw-display-box', label: '1 Paw - Display Box Model', code: 'Petcasting-1', price: 4500, strikePrice: 5500 },
      { slug: '1-paw-frame', label: '1 Paw - Frame Model', code: 'Petcasting-1', price: 5000, strikePrice: 6000 },
      { slug: '2-paw-frame', label: '2 Paw - Frame Model', code: 'Petcasting-1', price: 6500, strikePrice: 8000 },
    ],
    warranty: '2 Years for casting color',
    castingDelivery: BABY_CASTING_DELIVERY,
    finalDelivery: NAME_TAGLINE_FINAL_DELIVERY,
    castingProcess: 'It will take 20 minutes for casting.',
    materials: SKIN_SAFE_MATERIALS,
  },
  {
    slug: 'mother-milk-jewellery',
    label: 'Mother Milk Jewellery',
    models: [
      { slug: 'gold', label: 'Gold', priceFormula: 'Gold rate + 3% GST + 18% wastage' },
      { slug: 'silver', label: 'Silver', price: 5500 },
      { slug: 'without-metal', label: 'Without Metal', price: 1000 },
    ],
    preservation: [
      "Courier the preservation materials like mother's milk, baby hair, nail, umbilical cord to Lifecasting Studio address.",
    ],
    finalDelivery: [
      'It will take 4 to 5 weeks for final product delivery.',
      'Final product delivery either collect from studio or book for porter.',
    ],
  },
  {
    slug: 'resin-art',
    label: 'Resin Art',
    models: [
      {
        slug: 'garland-preservation',
        label: 'Garland Preservation - Frame Model',
        sizeTiers: RESIN_SIZE_TIERS,
        preservationNote:
          'Courier the items to be preserved to the Lifecasting Studio address (Ex: Garland/Flowers, yellow thread, bangles, photo, aksathai rice, toe ring, etc.).',
      },
      {
        slug: 'baby-keepsake',
        label: 'Baby Keepsake',
        sizeTiers: RESIN_SIZE_TIERS,
        preservationNote:
          'Courier the items to be preserved to the Lifecasting Studio address (Ex: Hair, nail, umbilical cord, bangles, baby anklets, pregnancy kit, hospital badge, etc.).',
      },
      {
        slug: 'parent-keepsake',
        label: 'Parent Keepsake',
        sizeTiers: RESIN_SIZE_TIERS,
        preservationNote:
          'Courier the items to be preserved to the Lifecasting Studio address (Ex: Chain, specs, watch, ID card, pen, mobile, ring, etc.).',
      },
    ],
    finalDelivery: RESIN_FINAL_DELIVERY,
  },
]

const HERO_IMAGES = Array.from({ length: 8 }, (_, index) => ({
  src: '/images/hero/lcs-1.png',
  title: 'Lifecasting Studio',
  position: index,
}))

const GALLERY_IMAGES = [
  { src: '/images/gallery/1h1f-standard.jpeg', category: 'baby-2', title: '1 Hand + 1 Feet Standard' },
  { src: '/images/gallery/1h1f-customized.jpg', category: 'baby-2', title: '1 Hand + 1 Feet Customized' },
  { src: '/images/gallery/two-1.jpeg', category: 'baby-2', title: 'Baby Casting Detail' },
  { src: '/images/gallery/two-2.jpeg', category: 'baby-2', title: 'Elegant Frame Design' },
  { src: '/images/gallery/two-3.jpeg', category: 'baby-2', title: 'Premium Finish' },
  { src: '/images/gallery/two-4.jpeg', category: 'baby-2', title: 'Custom Design' },
  { src: '/images/gallery/2h2f-standard.jpg', category: 'baby-4', title: '2 Hands + 2 Feet Standard' },
  { src: '/images/gallery/2h2f-customized.jpeg', category: 'baby-4', title: '2 Hands + 2 Feet Customized' },
  { src: '/images/gallery/2h2f-standard-1.jpg', category: 'baby-4', title: 'Complete Set Display' },
  { src: '/images/gallery/2h2f-standard-2.jpg', category: 'baby-4', title: 'Family Keepsake' },
  { src: '/images/gallery/2h2f-standard-3.jpeg', category: 'baby-4', title: 'Luxury Collection' },
  { src: '/images/gallery/2h2f-standard-4.jpg', category: 'baby-4', title: 'Premium Package' },
  { src: '/images/gallery/2h2f-customized-2.jpg', category: 'baby-4', title: 'Customized Package' },
  { src: '/images/gallery/2h2f-customized-3.jpg', category: 'baby-4', title: 'Customized Package' },
  { src: '/images/gallery/2h2f-customized-4.jpg', category: 'baby-4', title: 'Customized Package' },
  { src: '/images/gallery/2h2f-customized-5.jpg', category: 'baby-4', title: 'Customized Package' },
  { src: '/images/gallery/2h2f-customized-6.jpg', category: 'baby-4', title: 'Customized Package' },
  { src: '/images/gallery/2h2f-customized-7.jpg', category: 'baby-4', title: 'Customized Package' },
].map((image, index) => ({ ...image, position: index }))

const TESTIMONIALS = [
  {
    name: 'Rakesh Chouksey',
    category: 'Baby Casting',
    rating: 5,
    reviewHref: 'https://share.google/KsoWoVpRx1gCcubzn',
    avatarUrl:
      'https://lh3.googleusercontent.com/a-/ALV-UjVPBajCO1BSjYyVcjsIMNzTRcg0dUDelSR7QFjQ9j7hbdUbXFWm=w72-h72-p-rp-mo-br100',
    quote:
      "I had a wonderful experience with Lifecasting studio for my baby's hand and foot casting. The team was extremely professional, gentle, and patient throughout the entire process. They handled my baby with great care and ensured that the impressions were perfect. The final casts came out beautifully — highly detailed and finished with great precision. It's a truly special keepsake that we will cherish forever.",
  },
  {
    name: 'Sangeetha Mani',
    category: 'Baby Casting',
    rating: 5,
    reviewHref: 'https://share.google/3zHe3NwzkOEpJpFGq',
    quote:
      'It was so mesmerising memory for us to get this beauty of art where we were waiting for and finally we got it, who nailed it!! perfectly as expected which she created with so much of patient and much needed comfort zone as we wanted. Though there was a delay but output of the delivery was superb. Thank you so much Ambika, would highly recommend!',
  },
  {
    name: 'Arpan Nayek',
    category: 'Baby Casting',
    rating: 5,
    reviewHref: 'https://share.google/3tXnOW4F4ZPnjuV4d',
    avatarUrl:
      'https://lh3.googleusercontent.com/a-/ALV-UjUDyPUURmzfViRFA3W_giDz2klwxNxeDLDjfFVfAyTFJrNW7E_i=w72-h72-p-rp-mo-br100',
    quote:
      'I reached out to lifecasting studio by seeing their work in google and instagram and i am really happy the way casting turned out. It was perfect. Also Ambika and her staffs are very welcoming and approachable. Thank you so much.',
  },
].map((testimonial, index) => ({ ...testimonial, position: index }))

const FAQS = [
  {
    question: 'What is lifecasting?',
    answer:
      'Lifecasting is the art of creating a three-dimensional replica of a body part using safe, skin-friendly molding materials. We specialize in capturing precious moments like baby hands and feet, transforming them into beautiful keepsakes that last forever.',
  },
  {
    question: 'Is lifecasting safe for babies?',
    answer:
      'Absolutely! We use medical-grade, hypoallergenic materials that are completely safe for babies. The process is gentle, quick, and causes no discomfort to your little one.',
  },
  {
    question: 'What is the best age for baby hand and feet casting?',
    answer:
      'We recommend lifecasting from day two onwards up to 6 months for the tiniest impressions. However, we can create beautiful casts for babies up to 12 months and beyond.',
  },
  {
    question: 'How long does the casting process take?',
    answer:
      'The actual molding process takes just 3-5 minutes. The entire session typically takes 20-30 minutes including preparation and setup.',
  },
  {
    question: 'Can I customize my lifecast?',
    answer:
      'Yes! We offer extensive customization including frame color, finish type (gold, silver, bronze), personalized name plates, photo inclusion, and decorative elements.',
  },
  {
    question: 'How long does it take to receive the finished product?',
    answer:
      "Standard lifecasts are completed within 2-3 weeks. Customized pieces may take 3-4 weeks. We'll keep you updated throughout the process.",
  },
  {
    question: 'Do you offer home visits for lifecasting sessions?',
    answer:
      'Yes! We offer convenient home visit services within Bangalore for an additional fee, ensuring your baby is in a familiar environment.',
  },
].map((faq, index) => ({ ...faq, position: index }))

const NAV_LINKS = [
  { group: 'customer-service', label: 'Shipping & Delivery Policy', href: '/pages/shipping-policy' },
  { group: 'customer-service', label: 'Return Policy', href: '/pages/returns-refund-policy' },
  { group: 'customer-service', label: 'About Us', href: '/about' },
  { group: 'customer-service', label: 'Contact Us', href: '/contact' },
].map((link, index) => ({ ...link, position: index }))

function toPricingConfig(model: SeedModel): { pricingType: 'flat' | 'ageTiers' | 'sizeTiers' | 'formula'; pricingConfig: unknown } {
  if (model.ageTiers) return { pricingType: 'ageTiers', pricingConfig: { tiers: model.ageTiers } }
  if (model.sizeTiers) return { pricingType: 'sizeTiers', pricingConfig: { tiers: model.sizeTiers } }
  if (model.priceFormula) return { pricingType: 'formula', pricingConfig: { text: model.priceFormula } }
  return { pricingType: 'flat', pricingConfig: { price: model.price, strikePrice: model.strikePrice } }
}

async function seedAdminUser() {
  const username = process.env.SEED_ADMIN_USERNAME ?? 'admin'
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'lifecasting-admin'
  const existing = await prisma.adminUser.findUnique({ where: { username } })
  if (existing) return
  const passwordHash = await bcrypt.hash(password, 10)
  await prisma.adminUser.create({ data: { username, passwordHash } })
  console.log(`Seeded admin user "${username}" — change this password after first login.`)
}

async function seedCatalog() {
  for (const [categoryIndex, category] of CATALOG.entries()) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      create: {
        slug: category.slug,
        label: category.label,
        position: categoryIndex,
        filters: category.filters ?? undefined,
        warranty: category.warranty,
        castingDelivery: category.castingDelivery ?? undefined,
        finalDelivery: category.finalDelivery ?? undefined,
        castingProcess: category.castingProcess,
        materials: category.materials ?? undefined,
        preservation: category.preservation ?? undefined,
        showReviews: category.showReviews ?? false,
      },
      update: {},
    })

    for (const [modelIndex, model] of category.models.entries()) {
      const { pricingType, pricingConfig } = toPricingConfig(model)
      await prisma.model.upsert({
        where: { categoryId_slug: { categoryId: created.id, slug: model.slug } },
        create: {
          categoryId: created.id,
          slug: model.slug,
          label: model.label,
          code: model.code,
          group: model.group,
          position: modelIndex,
          pricingType,
          pricingConfig: pricingConfig as never,
          preservationNote: model.preservationNote,
        },
        update: {},
      })
    }
  }
}

async function seedHomepageContent() {
  if ((await prisma.heroImage.count()) === 0) {
    await prisma.heroImage.createMany({ data: HERO_IMAGES })
  }
  if ((await prisma.galleryImage.count()) === 0) {
    await prisma.galleryImage.createMany({ data: GALLERY_IMAGES })
  }
  if ((await prisma.testimonial.count()) === 0) {
    await prisma.testimonial.createMany({ data: TESTIMONIALS })
  }
  if ((await prisma.faq.count()) === 0) {
    await prisma.faq.createMany({ data: FAQS })
  }
  if ((await prisma.navLink.count()) === 0) {
    await prisma.navLink.createMany({ data: NAV_LINKS })
  }
}

async function seedFooterAndSettings() {
  await prisma.footerSettings.upsert({
    where: { id: 'singleton' },
    create: {
      id: 'singleton',
      tagline:
        'Preserve your precious memories forever with our expert lifecasting services. Safe, professional, and beautifully crafted keepsakes.',
      safetyTitle: 'Safety First',
      safetyText:
        'We use only safe, non-toxic materials suitable for babies and sensitive skin. Your comfort and safety are our top priorities.',
      phone: '+91 63838 93672',
      phoneHref: 'tel:+916383893672',
      email: 'lifecastingstudio.blr@gmail.com',
      addressLine1: '1st floor, 213, 1st Main Rd',
      addressLine2: 'AECS Layout - A Block',
      addressLine3: 'Marathahalli, Bengaluru 560037',
      businessHours: [
        { label: 'Monday - Saturday', hours: '10:00 AM - 8:00 PM' },
        { label: 'Sunday', hours: '11:00 AM - 7:00 PM' },
      ],
      socialLinks: [
        { label: 'Instagram', href: 'https://www.instagram.com/lifecasting_studio/?hl=en', icon: 'instagram' },
        { label: 'Facebook', href: 'https://www.facebook.com/lifecastingstudio.blr', icon: 'facebook' },
        { label: 'Email', href: 'mailto:lifecastingstudio.blr@gmail.com', icon: 'email' },
      ],
      privacyHref: '/privacy',
      termsHref: '/terms',
    },
    update: {},
  })

  await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    create: {
      id: 'singleton',
      whatsappNumber: '916383893672',
      bookingMessageTemplate:
        'Hi! I\'d like to book "{{modelLabel}}" under {{categoryLabel}}. Please share more details.\nPhoto: {{imageUrl}}',
      priceDisclaimer: 'All prices are in Indian Rupees (INR). Final pricing may vary based on customization.',
      viewAllReviewsHref: 'https://www.google.com/search?q=Lifecasting+studio+Reviews',
      shippingPolicy: `Shipping Policy – Bangalore Only

At this time, we offer product delivery within Bangalore through the following two options:

1. Customer Pickup – In Person
Customers can collect their completed product directly from our Lifecasting Studio in Bangalore.

2. Customer-Arranged Transportation
Customers may arrange transportation through Porter, Uber, Ola, or any other suitable transport service. We will securely pack the completed product and hand it over to the delivery person designated by the customer.

Important: The customer is responsible for booking the transportation service and any associated delivery charges. Once the product has been handed over to the customer's designated delivery person, the responsibility for transportation and delivery rests with the customer.`,
    },
    update: {},
  })
}

async function main() {
  await seedAdminUser()
  await seedCatalog()
  await seedHomepageContent()
  await seedFooterAndSettings()
  console.log('Seed complete.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
