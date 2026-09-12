"""Fill in category content from the studio's specification document.

Idempotent: re-running replaces each category's materials and delivery rules
rather than appending, so it is safe to run after edits in admin (those edits
will be overwritten — that is the point of having one source of truth here).

    python manage.py seed_categories            # all categories
    python manage.py seed_categories --dry-run  # show what would change
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from catalog.models import Category, CategoryDeliveryRule

# ── the three repeated blocks, written once ──────────────────────────────
# These are identical across every category that uses them. Kept here as
# named constants so a change to the doorstep charge is a one-line edit.

MATERIALS_BABY = (
    'Baby skin safe material',
    'Completely organic and non-toxic',
    'Life of the casting will be long lasting',
)
MATERIALS_GENERAL = (
    'Skin safe material',
    'Completely organic and non-toxic',
    'Life of the casting will be long lasting',
)

CASTING_SESSION = (
    'For casting: book the slot and visit the studio for casting.',
    'We also provide doorstep service up to 25 km, with a service charge of Rs.1000/-',
    'Beyond 25 km, transport charges apply.',
)

FINAL_BABY = (
    'Once you provide all the details — photos and baby details — it takes '
    '3 to 4 weeks for product delivery.',
    'Collect the final product from the studio, or book a porter.',
)
FINAL_NAME_TAGLINE = (
    'Once you provide all the details — photos, name and tagline — it takes '
    '3 to 4 weeks for product delivery.',
    'Collect the final product from the studio, or book a porter.',
)
FINAL_PRESERVATION = (
    'It takes 4 to 5 weeks for final product delivery.',
    'Collect the final product from the studio, or book a porter.',
)

PROCESS_BABY = (
    'Handling the baby takes about 5 minutes. The full casting process depends '
    'on how the baby settles, and usually takes 30 to 40 minutes.'
)
PROCESS_SHORT = 'It takes about 20 minutes for casting.'

WARRANTY = '2 Years for casting colour'

# ── per-category content ─────────────────────────────────────────────────
# Only what genuinely differs per category is listed.

CATEGORIES = {
    'baby-casting': {
        'materials': MATERIALS_BABY,
        'casting': CASTING_SESSION,
        'final': FINAL_BABY,
        'process': PROCESS_BABY,
    },
    'parent-with-baby': {
        'materials': MATERIALS_BABY,
        'casting': CASTING_SESSION,
        'final': FINAL_BABY,
        'process': PROCESS_BABY,
    },
    'couple-casting': {
        'materials': MATERIALS_GENERAL,
        'casting': CASTING_SESSION,
        'final': FINAL_NAME_TAGLINE,
        'process': PROCESS_SHORT,
    },
    'sibling-casting': {
        'materials': MATERIALS_BABY,
        'casting': CASTING_SESSION,
        'final': FINAL_BABY,
        'process': PROCESS_BABY,
    },
    'aashirvaad-casting': {
        'materials': MATERIALS_GENERAL,
        'casting': CASTING_SESSION,
        'final': FINAL_NAME_TAGLINE,
        'process': PROCESS_SHORT,
    },
    'family-casting': {
        'materials': MATERIALS_BABY,
        'casting': CASTING_SESSION,
        'final': FINAL_BABY,
        'process': PROCESS_BABY,
    },
    'pet-casting': {
        'materials': MATERIALS_GENERAL,
        'casting': CASTING_SESSION,
        'final': FINAL_NAME_TAGLINE,
        'process': PROCESS_SHORT,
    },
    # The last two are preservation services, not castings: no casting session,
    # no materials list, and a longer turnaround.
    'mother-milk-jewellery': {
        'materials': (),
        'casting': (
            'Courier the items to be preserved — mother’s milk, baby hair, '
            'nails, umbilical cord — to the Lifecasting Studio address.',
        ),
        'final': FINAL_PRESERVATION,
        'process': '',
        'warranty': '',
    },
    'resin-art': {
        'materials': (),
        'casting': (
            'Courier the items to be preserved to the Lifecasting Studio address.',
            'Garland preservation: garland or flowers, yellow thread, bangles, '
            'photo, akshathai rice, toe ring, and similar.',
            'Baby keepsake: hair, nails, umbilical cord, bangles, anklets, '
            'pregnancy kit, hospital badge, and similar.',
            'Parent keepsake: chain, spectacles, watch, ID card, pen, mobile, '
            'ring, and similar.',
        ),
        'final': FINAL_PRESERVATION,
        'process': '',
        'warranty': '',
    },
}


class Command(BaseCommand):
    help = 'Fill in category materials, delivery rules, process and warranty.'

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true',
                            help='Report what would change without writing.')

    def handle(self, *args, **options):
        dry = options['dry_run']
        missing = []
        touched = 0

        for slug, spec in CATEGORIES.items():
            category = Category.objects.filter(slug=slug).first()
            if not category:
                missing.append(slug)
                continue

            mats = spec['materials']
            casting = spec['casting']
            final = spec['final']
            self.stdout.write(
                f'  {category.label:24} materials={len(mats)} '
                f'casting={len(casting)} final={len(final)}'
            )
            if dry:
                continue

            with transaction.atomic():
                # One line per bullet — the site splits on newlines.
                category.materials_text = '\n'.join(mats)
                category.casting_session_text = '\n'.join(casting)
                category.final_delivery_text = '\n'.join(final)
                category.casting_process = spec.get('process', '')
                category.warranty = spec.get('warranty', WARRANTY)
                category.save(update_fields=[
                    'materials_text', 'casting_session_text', 'final_delivery_text',
                    'casting_process', 'warranty',
                ])

                # The old row tables are no longer shown in admin or rendered;
                # clear them so there is only one source of truth.
                category.material_items.all().delete()
                category.delivery_rules.all().delete()
            touched += 1

        if missing:
            self.stdout.write(self.style.WARNING(
                f'\n  not found in the database: {", ".join(missing)}'))
        if dry:
            self.stdout.write(self.style.WARNING('\n  dry run — nothing written'))
        else:
            self.stdout.write(self.style.SUCCESS(f'\n  {touched} categories updated'))
