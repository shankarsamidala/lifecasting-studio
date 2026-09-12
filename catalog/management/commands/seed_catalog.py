from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from catalog.models import (
    Category,
    CastingModel,
    HeroImage,
    GalleryImage,
    Testimonial,
    Faq,
    SiteSettings,
    FooterSettings,
)

BABY_CASTING_DELIVERY = [
    'Book the slot and visit the studio for casting.',
    'We also provide door-step service up to 25KM with a service charge of ₹1,000.',
    'More than 25KMs, transport charges apply.',
]
BABY_FINAL_DELIVERY = [
    'After the customer provides all the details like photos and baby details, it takes 3 to 4 weeks for product delivery.',
    'Final product delivery either collect from studio or book for porter.',
]
NAME_TAGLINE_FINAL_DELIVERY = [
    'After the customer provides all the details like photos, name, tagline, it takes 3 to 4 weeks for product delivery.',
    'Final product delivery either collect from studio or book for porter.',
]
BABY_CASTING_PROCESS = (
    'The baby casting dealing with the baby is 5 minutes. The entire casting process depends on the baby co-operation and takes approx. 30 to 40 minutes.'
)
BABY_MATERIALS = [
    'Baby skin safe material',
    'Completely organic and non-toxic',
    'Life of the casting will be long lasting',
]
SKIN_SAFE_MATERIALS = [
    'Skin safe material',
    'Completely organic and non-toxic',
    'Life of the casting will be long lasting',
]
RESIN_SIZE_TIERS = [
    {'label': '9 inch x 12 inch', 'price': 5999, 'strikePrice': 6999},
    {'label': '12 inch x 16 inch', 'price': 6999, 'strikePrice': 7999},
    {'label': '14 inch x 16 inch', 'price': 7999, 'strikePrice': 8999},
    {'label': '14 inch x 18 inch', 'price': 8799, 'strikePrice': 9999},
    {'label': '16 inch x 18 inch', 'price': 8999, 'strikePrice': 10500},
    {'label': '18 inch x 24 inch', 'price': 14999, 'strikePrice': 16999},
]
RESIN_FINAL_DELIVERY = [
    'It will take 4 to 5 weeks for final product delivery.',
    'Final product delivery either collect from studio or book for porter.',
]

CATALOG_SEED = [
    {
        'slug': 'baby-casting',
        'label': 'Baby Casting',
        'filters': [
            {'slug': '2-casting', 'label': '2 Casting'},
            {'slug': '4-casting', 'label': '4 Casting'},
        ],
        'models': [
            {
                'slug': '1-hand-1-feet-standard',
                'label': '1 Hand + 1 Feet - Standard',
                'code': 'LCS-1H1F-STD-001',
                'group': '2-casting',
                'badge': 'BESTSELLER',
                'rating': 5.0,
                'review_count': 42,
                'pricing_type': 'ageTiers',
                'pricing_config': {
                    'tiers': [
                        {'label': '0 to 1 year', 'price': 6500, 'strikePrice': 7500},
                        {'label': '1 year and above', 'price': 8500, 'strikePrice': 9500},
                    ]
                },
                'image_url': '/static/images/gallery/1h1f-standard.webp',
            },
            {
                'slug': '1-hand-1-feet-customized',
                'label': '1 Hand + 1 Feet - Customized',
                'code': 'LCS-1H1F-CUST-002',
                'group': '2-casting',
                'badge': 'NEW',
                'rating': 4.9,
                'review_count': 38,
                'pricing_type': 'ageTiers',
                'pricing_config': {
                    'tiers': [
                        {'label': '0 to 1 year', 'price': 7500, 'strikePrice': 8500},
                        {'label': '1 year and above', 'price': 9500, 'strikePrice': 10500},
                    ]
                },
                'image_url': '/static/images/gallery/1h1f-customized.webp',
            },
            {
                'slug': '2-hands-2-feet-standard',
                'label': '2 Hands + 2 Feet - Standard',
                'code': 'LCS-2H2F-STD-003',
                'group': '4-casting',
                'badge': 'POPULAR',
                'rating': 5.0,
                'review_count': 29,
                'pricing_type': 'ageTiers',
                'pricing_config': {
                    'tiers': [
                        {'label': '0 to 1 year', 'price': 11000, 'strikePrice': 13000},
                        {'label': '1 year and above', 'price': 13000, 'strikePrice': 15000},
                    ]
                },
                'image_url': '/static/images/gallery/2h2f-standard.webp',
            },
            {
                'slug': '2-hands-2-feet-customized',
                'label': '2 Hands + 2 Feet - Customized',
                'code': 'LCS-2H2F-CUST-004',
                'group': '4-casting',
                'badge': 'LUXURY CHOICE',
                'rating': 5.0,
                'review_count': 31,
                'pricing_type': 'ageTiers',
                'pricing_config': {
                    'tiers': [
                        {'label': '0 to 1 year', 'price': 13500, 'strikePrice': 16000},
                        {'label': '1 year and above', 'price': 15500, 'strikePrice': 18000},
                    ]
                },
                'image_url': '/static/images/gallery/2h2f-customized.webp',
            },
        ],
        'warranty': '2 Years for casting color',
        'casting_delivery': BABY_CASTING_DELIVERY,
        'final_delivery': BABY_FINAL_DELIVERY,
        'casting_process': BABY_CASTING_PROCESS,
        'materials': BABY_MATERIALS,
        'show_reviews': True,
    },
    {
        'slug': 'parent-with-baby',
        'label': 'Parent with Baby',
        'models': [
            {
                'slug': '3-hands-display-box',
                'label': '3 Hands - Display Box Model',
                'code': 'Parentwithbaby-1',
                'badge': 'FAMILY FAVORITE',
                'rating': 4.9,
                'review_count': 27,
                'pricing_type': 'flat',
                'pricing_config': {'price': 8000, 'strikePrice': 9000},
                'image_url': '/static/images/gallery/two-1.webp',
            },
        ],
        'warranty': '2 Years for casting color',
        'casting_delivery': BABY_CASTING_DELIVERY,
        'final_delivery': BABY_FINAL_DELIVERY,
        'casting_process': BABY_CASTING_PROCESS,
        'materials': BABY_MATERIALS,
    },
    {
        'slug': 'couple-casting',
        'label': 'Couple Casting',
        'models': [
            {
                'slug': '2-hands-display-box',
                'label': '2 Hands - Display Box Model',
                'code': 'LCS-2H-001',
                'badge': 'TRENDING',
                'rating': 5.0,
                'review_count': 56,
                'pricing_type': 'flat',
                'pricing_config': {'price': 6500, 'strikePrice': 7500},
                'image_url': '/static/images/gallery/two-2.webp',
            },
        ],
        'warranty': '2 Years for casting color',
        'casting_delivery': BABY_CASTING_DELIVERY,
        'final_delivery': NAME_TAGLINE_FINAL_DELIVERY,
        'casting_process': 'It will take 20 minutes for casting.',
        'materials': SKIN_SAFE_MATERIALS,
    },
    {
        'slug': 'sibling-casting',
        'label': 'Sibling Casting',
        'models': [
            {
                'slug': '2-hands-display-box',
                'label': '2 Hands - Display Box Model',
                'code': 'sibling-1',
                'rating': 4.8,
                'review_count': 19,
                'pricing_type': 'flat',
                'pricing_config': {'price': 6500, 'strikePrice': 7500},
                'image_url': '/static/images/gallery/two-3.webp',
            },
            {
                'slug': '2-hands-frame',
                'label': '2 Hands - Frame Model',
                'code': 'sibling-2',
                'rating': 4.9,
                'review_count': 22,
                'pricing_type': 'flat',
                'pricing_config': {'price': 8000, 'strikePrice': 9000},
                'image_url': '/static/images/gallery/two-4.webp',
            },
        ],
        'warranty': '2 Years for casting color',
        'casting_delivery': BABY_CASTING_DELIVERY,
        'final_delivery': BABY_FINAL_DELIVERY,
        'casting_process': BABY_CASTING_PROCESS,
        'materials': BABY_MATERIALS,
    },
    {
        'slug': 'aashirvaad-casting',
        'label': 'Aashirvaad Casting',
        'models': [
            {
                'slug': '2-hands-display-box',
                'label': '2 Hands - Display Box Model',
                'code': 'aashirvad-1',
                'badge': 'BLESSINGS',
                'rating': 5.0,
                'review_count': 34,
                'pricing_type': 'flat',
                'pricing_config': {'price': 6500, 'strikePrice': 7500},
                'image_url': '/static/images/gallery/2h2f-standard-1.webp',
            },
            {
                'slug': '2-hands-frame',
                'label': '2 Hands - Frame Model',
                'code': 'aashirvad-2',
                'rating': 4.9,
                'review_count': 18,
                'pricing_type': 'flat',
                'pricing_config': {'price': 8000, 'strikePrice': 9000},
                'image_url': '/static/images/gallery/2h2f-standard-2.webp',
            },
        ],
        'warranty': '2 Years for casting color',
        'casting_delivery': BABY_CASTING_DELIVERY,
        'final_delivery': NAME_TAGLINE_FINAL_DELIVERY,
        'casting_process': 'It will take 20 minutes for casting.',
        'materials': SKIN_SAFE_MATERIALS,
    },
    {
        'slug': 'family-casting',
        'label': 'Family Casting',
        'models': [
            {
                'slug': '3-hands-display-box',
                'label': '3 Hands - Display Box Model',
                'code': 'familycasting-1',
                'rating': 4.9,
                'review_count': 25,
                'pricing_type': 'flat',
                'pricing_config': {'price': 8000, 'strikePrice': 9000},
                'image_url': '/static/images/gallery/2h2f-standard-3.webp',
            },
            {
                'slug': '4-hands-frame',
                'label': '4 Hands - Frame Model',
                'code': 'familycasting-2',
                'badge': 'PREMIUM SET',
                'rating': 5.0,
                'review_count': 41,
                'pricing_type': 'flat',
                'pricing_config': {'price': 12000, 'strikePrice': 14500},
                'image_url': '/static/images/gallery/2h2f-standard-4.webp',
            },
        ],
        'warranty': '2 Years for casting color',
        'casting_delivery': BABY_CASTING_DELIVERY,
        'final_delivery': BABY_FINAL_DELIVERY,
        'casting_process': BABY_CASTING_PROCESS,
        'materials': BABY_MATERIALS,
    },
    {
        'slug': 'pet-casting',
        'label': 'Pet Casting',
        'models': [
            {
                'slug': '1-paw-display-box',
                'label': '1 Paw - Display Box Model',
                'code': 'Petcasting-1',
                'rating': 4.9,
                'review_count': 16,
                'pricing_type': 'flat',
                'pricing_config': {'price': 4500, 'strikePrice': 5500},
                'image_url': '/static/images/gallery/2h2f-customized-2.webp',
            },
            {
                'slug': '1-paw-frame',
                'label': '1 Paw - Frame Model',
                'code': 'Petcasting-2',
                'rating': 5.0,
                'review_count': 20,
                'pricing_type': 'flat',
                'pricing_config': {'price': 5000, 'strikePrice': 6000},
                'image_url': '/static/images/gallery/2h2f-customized-3.webp',
            },
            {
                'slug': '2-paw-frame',
                'label': '2 Paw - Frame Model',
                'code': 'Petcasting-3',
                'badge': 'PET FAVORITE',
                'rating': 5.0,
                'review_count': 23,
                'pricing_type': 'flat',
                'pricing_config': {'price': 6500, 'strikePrice': 8000},
                'image_url': '/static/images/gallery/2h2f-customized-4.webp',
            },
        ],
        'warranty': '2 Years for casting color',
        'casting_delivery': BABY_CASTING_DELIVERY,
        'final_delivery': NAME_TAGLINE_FINAL_DELIVERY,
        'casting_process': 'It will take 20 minutes for casting.',
        'materials': SKIN_SAFE_MATERIALS,
    },
    {
        'slug': 'mother-milk-jewellery',
        'label': 'Mother Milk Jewellery',
        'models': [
            {
                'slug': 'gold',
                'label': 'Gold',
                'badge': 'LUXURY JEWELLERY',
                'rating': 5.0,
                'review_count': 32,
                'pricing_type': 'formula',
                'pricing_config': {'text': 'Gold rate + 3% GST + 18% wastage'},
                'image_url': '/static/images/gallery/2h2f-customized-5.webp',
            },
            {
                'slug': 'silver',
                'label': 'Silver',
                'rating': 4.9,
                'review_count': 28,
                'pricing_type': 'flat',
                'pricing_config': {'price': 5500, 'strikePrice': 6500},
                'image_url': '/static/images/gallery/2h2f-customized-6.webp',
            },
            {
                'slug': 'without-metal',
                'label': 'Without Metal',
                'rating': 4.8,
                'review_count': 15,
                'pricing_type': 'flat',
                'pricing_config': {'price': 1000, 'strikePrice': 1500},
                'image_url': '/static/images/gallery/2h2f-customized-7.webp',
            },
        ],
        'preservation': [
            "Courier the preservation materials like mother's milk, baby hair, nail, umbilical cord to Lifecasting Studio address."
        ],
        'final_delivery': RESIN_FINAL_DELIVERY,
    },
    {
        'slug': 'resin-art',
        'label': 'Resin Art',
        'models': [
            {
                'slug': 'garland-preservation',
                'label': 'Garland Preservation - Frame Model',
                'badge': 'WEDDING KEEPSAKE',
                'rating': 5.0,
                'review_count': 45,
                'pricing_type': 'sizeTiers',
                'pricing_config': {'tiers': RESIN_SIZE_TIERS},
                'preservation_note': (
                    'Courier the items to be preserved to the Lifecasting Studio address (Ex: Garland/Flowers, yellow thread, bangles, photo, aksathai rice, toe ring, etc.).'
                ),
                'image_url': '/static/images/gallery/1h1f-standard.webp',
            },
            {
                'slug': 'baby-keepsake',
                'label': 'Baby Keepsake',
                'badge': 'POPULAR',
                'rating': 4.9,
                'review_count': 33,
                'pricing_type': 'sizeTiers',
                'pricing_config': {'tiers': RESIN_SIZE_TIERS},
                'preservation_note': (
                    'Courier the items to be preserved to the Lifecasting Studio address (Ex: Hair, nail, umbilical cord, bangles, baby anklets, pregnancy kit, hospital badge, etc.).'
                ),
                'image_url': '/static/images/gallery/1h1f-customized.webp',
            },
            {
                'slug': 'parent-keepsake',
                'label': 'Parent Keepsake',
                'rating': 4.8,
                'review_count': 21,
                'pricing_type': 'sizeTiers',
                'pricing_config': {'tiers': RESIN_SIZE_TIERS},
                'preservation_note': (
                    'Courier the items to be preserved to the Lifecasting Studio address (Ex: Chain, specs, watch, ID card, pen, mobile, ring, etc.).'
                ),
                'image_url': '/static/images/gallery/two-1.webp',
            },
        ],
        'final_delivery': RESIN_FINAL_DELIVERY,
    },
]

TESTIMONIALS_SEED = [
    {
        'name': 'Rakesh Chouksey',
        'category': 'Baby Casting',
        'rating': 5,
        'review_href': 'https://share.google/KsoWoVpRx1gCcubzn',
        'avatar_url': (
            'https://lh3.googleusercontent.com/a-/ALV-UjVPBajCO1BSjYyVcjsIMNzTRcg0dUDelSR7QFjQ9j7hbdUbXFWm=w72-h72-p-rp-mo-br100'
        ),
        'quote': (
            "I had a wonderful experience with Lifecasting studio for my baby's hand and foot casting. The team was extremely professional, gentle, and patient throughout the entire process. They handled my baby with great care and ensured that the impressions were perfect. The final casts came out beautifully — highly detailed and finished with great precision. It's a truly special keepsake that we will cherish forever."
        ),
    },
    {
        'name': 'Sangeetha Mani',
        'category': 'Baby Casting',
        'rating': 5,
        'review_href': 'https://share.google/3zHe3NwzkOEpJpFGq',
        'avatar_url': '',
        'quote': (
            'It was so mesmerising memory for us to get this beauty of art where we were waiting for and finally we got it, who nailed it!! perfectly as expected which she created with so much of patient and much needed comfort zone as we wanted. Though there was a delay but output of the delivery was superb. Thank you so much Ambika, would highly recommend!'
        ),
    },
    {
        'name': 'Arpan Nayek',
        'category': 'Baby Casting',
        'rating': 5,
        'review_href': 'https://share.google/3tXnOW4F4ZPnjuV4d',
        'avatar_url': (
            'https://lh3.googleusercontent.com/a-/ALV-UjUDyPUURmzfViRFA3W_giDz2klwxNxeDLDjfFVfAyTFJrNW7E_i=w72-h72-p-rp-mo-br100'
        ),
        'quote': (
            'I reached out to lifecasting studio by seeing their work in google and instagram and i am really happy the way casting turned out. It was perfect. Also Ambika and her staffs are very welcoming and approachable. Thank you so much.'
        ),
    },
    {
        'name': 'Priya & Vikram Sharma',
        'category': 'Couples Hand Casting',
        'rating': 5,
        'review_href': 'https://g.page/r/lifecasting-studio-blr/review',
        'avatar_url': '',
        'quote': (
            'We got our anniversary hand cast done at Lifecasting Studio. Ambika made the entire process so easy and memorable. Every detail, right down to our ring designs, came out with stunning clarity in the golden finish. Highly recommended for couples looking for unique keepsakes!'
        ),
    },
    {
        'name': 'Ananya Rao',
        'category': 'Baby Casting',
        'rating': 5,
        'review_href': 'https://g.page/r/lifecasting-studio-blr/review',
        'avatar_url': '',
        'quote': (
            'Preserving our newborn twin’s hand and foot impressions was the best decision we made. The studio staff visited our home and handled our tiny baby with immense care and hygiene. The wooden frame with gold casts is an absolute masterpiece in our living room.'
        ),
    },
    {
        'name': 'Dr. Karthik & Sneha',
        'category': 'Family Casting',
        'rating': 5,
        'review_href': 'https://g.page/r/lifecasting-studio-blr/review',
        'avatar_url': '',
        'quote': (
            'We had a 3-generation family hand casting session with my parents and daughter. The team at Lifecasting Studio captured every crease and texture flawlessly. The preservation quality is top-notch and their customer service was transparent and warm.'
        ),
    },
]

FAQS_SEED = [
    {
        'question': 'What is lifecasting?',
        'answer': (
            'Lifecasting is the art of creating a three-dimensional replica of a body part using safe, skin-friendly molding materials. We specialize in capturing precious moments like baby hands and feet, transforming them into beautiful keepsakes that last forever.'
        ),
    },
    {
        'question': 'Is lifecasting safe for babies?',
        'answer': (
            'Absolutely! We use medical-grade, hypoallergenic materials that are completely safe for babies. The process is gentle, quick, and causes no discomfort to your little one.'
        ),
    },
    {
        'question': 'What is the best age for baby hand and feet casting?',
        'answer': (
            'We recommend lifecasting from day two onwards up to 6 months for the tiniest impressions. However, we can create beautiful casts for babies up to 12 months and beyond.'
        ),
    },
    {
        'question': 'How long does the casting process take?',
        'answer': (
            'The actual molding process takes just 3-5 minutes. The entire session typically takes 20-30 minutes including preparation and setup.'
        ),
    },
    {
        'question': 'Can I customize my lifecast?',
        'answer': (
            'Yes! We offer extensive customization including frame color, finish type (gold, silver, bronze), personalized name plates, photo inclusion, and decorative elements.'
        ),
    },
    {
        'question': 'How long does it take to receive the finished product?',
        'answer': (
            "Standard lifecasts are completed within 2-3 weeks. Customized pieces may take 3-4 weeks. We'll keep you updated throughout the process."
        ),
    },
    {
        'question': 'Do you offer home visits for lifecasting sessions?',
        'answer': (
            'Yes! We offer convenient home visit services within Bangalore for an additional fee, ensuring your baby is in a familiar environment.'
        ),
    },
]


class Command(BaseCommand):
    help = 'Seed catalog database with categories, models, testimonials, FAQs, and site settings'

    def handle(self, *args, **options):
        self.stdout.write('Seeding Lifecasting Studio database...')

        # Seed Admin Superuser
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@lifecastingstudio.in', 'admin123')
            self.stdout.write(self.style.SUCCESS('Created superuser "admin" with password "admin123"'))

        # Seed Categories & Models
        for cat_pos, cat_data in enumerate(CATALOG_SEED):
            models_data = cat_data.pop('models', [])
            category, created = Category.objects.update_or_create(
                slug=cat_data['slug'],
                defaults={
                    'label': cat_data['label'],
                    'position': cat_pos,
                    'filters': cat_data.get('filters') or [],
                    'warranty': cat_data.get('warranty') or '',
                    'casting_delivery': cat_data.get('casting_delivery') or [],
                    'final_delivery': cat_data.get('final_delivery') or [],
                    'casting_process': cat_data.get('casting_process') or '',
                    'materials': cat_data.get('materials') or [],
                    'preservation': cat_data.get('preservation') or [],
                    'show_reviews': cat_data.get('show_reviews', False),
                },
            )

            for mod_pos, mod_data in enumerate(models_data):
                CastingModel.objects.update_or_create(
                    category=category,
                    slug=mod_data['slug'],
                    defaults={
                        'label': mod_data['label'],
                        'code': mod_data.get('code') or '',
                        'group': mod_data.get('group') or '',
                        'badge': mod_data.get('badge') or '',
                        'rating': mod_data.get('rating', 5.0),
                        'review_count': mod_data.get('review_count', 24),
                        'position': mod_pos,
                        'pricing_type': mod_data.get('pricing_type', 'flat'),
                        'pricing_config': mod_data.get('pricing_config', {}),
                        'image_url': mod_data.get('image_url', ''),
                        'preservation_note': mod_data.get('preservation_note') or '',
                    },
                )

        # Seed Hero Images
        if HeroImage.objects.count() == 0:
            for i in range(4):
                HeroImage.objects.create(
                    src='/static/images/hero/lcs-1.webp',
                    title='Lifecasting Studio',
                    subtitle='Preserve precious memories in 3D gold & silver',
                    position=i,
                )

        # Seed Testimonials
        for pos, t_data in enumerate(TESTIMONIALS_SEED):
            Testimonial.objects.update_or_create(
                name=t_data['name'],
                defaults={
                    'category': t_data['category'],
                    'rating': t_data['rating'],
                    'review_href': t_data['review_href'],
                    'avatar_url': t_data['avatar_url'],
                    'quote': t_data['quote'],
                    'position': pos,
                },
            )

        # Seed FAQs
        for pos, faq_data in enumerate(FAQS_SEED):
            Faq.objects.update_or_create(
                question=faq_data['question'],
                defaults={
                    'answer': faq_data['answer'],
                    'position': pos,
                },
            )

        # Seed Site Settings & Footer Settings Singletons
        site_settings = SiteSettings.get_solo()
        site_settings.announcement_bar = '🚚 Doorstep Casting Sessions Available in Bangalore • Book Your Slot Today'
        site_settings.save()

        footer_settings = FooterSettings.get_solo()
        footer_settings.business_hours = [
            {'label': 'Monday - Saturday', 'hours': '10:00 AM - 8:00 PM'},
            {'label': 'Sunday', 'hours': '11:00 AM - 7:00 PM'},
        ]
        footer_settings.social_links = [
            {'label': 'Instagram', 'href': 'https://www.instagram.com/lifecasting_studio/?hl=en', 'icon': 'instagram'},
            {'label': 'Facebook', 'href': 'https://www.facebook.com/lifecastingstudio.blr', 'icon': 'facebook'},
            {'label': 'Email', 'href': 'mailto:lifecastingstudio.blr@gmail.com', 'icon': 'email'},
        ]
        footer_settings.save()

        self.stdout.write(self.style.SUCCESS('Successfully seeded database catalog, settings, and content!'))
