from django.db import models
from django.utils.text import slugify

from .fields import OptimizedImageField


PLACEHOLDER_IMAGE = '/static/images/gallery/1h1f-standard.webp'


class Category(models.Model):
    label = models.CharField(
        max_length=200,
        verbose_name='Category name',
        help_text="What customers see, e.g. 'Baby Casting'.",
    )
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True, default='', help_text="Overview description for category detail page")
    image = OptimizedImageField(
        upload_to='categories/', blank=True, null=True,
        verbose_name='Banner image',
        help_text='Optional. Resized and converted automatically on upload.',
    )
    position = models.IntegerField(
        default=0,
        verbose_name='Display order',
        help_text='Lower numbers appear first.',
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name='Show on website',
        help_text='Untick to hide this category everywhere.',
    )
    warranty = models.CharField(
        max_length=200, blank=True,
        default='2-Year Colour Warranty',
        verbose_name='Warranty line',
        help_text='Shown under the category heading. Pre-filled with the studio '
                  'standard — change it or clear it if this category differs.',
    )
    filters = models.JSONField(blank=True, null=True, default=list, help_text="List of sub-filter dicts e.g. [{'slug': '2-casting', 'label': '2 Casting'}]")
    casting_delivery = models.JSONField(blank=True, null=True, default=list, help_text="List of casting delivery rules")
    final_delivery = models.JSONField(blank=True, null=True, default=list, help_text="List of final product delivery rules")
    casting_process = models.TextField(
        blank=True, default='',
        verbose_name='Casting process',
        help_text='How long the session takes and what happens during it.',
    )
    materials = models.JSONField(blank=True, null=True, default=list, help_text="List of material description strings")
    preservation = models.JSONField(blank=True, null=True, default=list, help_text="List of preservation instructions")
    # One box per list, one bullet per line. Simpler to edit than a table of
    # inline rows, and the site renders each line as a bullet point.
    materials_text = models.TextField(
        blank=True, default='',
        verbose_name='Materials used',
        help_text='One point per line. Each line becomes a bullet on the site.',
    )
    casting_session_text = models.TextField(
        blank=True, default='',
        verbose_name='Casting session details',
        help_text='One point per line — booking, doorstep service, travel charges.',
    )
    final_delivery_text = models.TextField(
        blank=True, default='',
        verbose_name='Final delivery details',
        help_text='One point per line — turnaround time and how it is collected.',
    )

    offered_names = models.ManyToManyField(
        'ProductName', blank=True, related_name='categories',
        verbose_name='Product names offered',
        help_text='Which product names this category sells. These become the '
                  'options in the product form and the filter tabs on the page.',
    )
    show_reviews = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['position', 'id']
        verbose_name = 'Casting category'
        verbose_name_plural = 'Casting categories'

    def __str__(self):
        return self.label

    def save(self, *args, **kwargs):
        # Derived, never typed: slugs have URL rules a studio owner should not
        # have to know, and a typo here changes a live page address.
        if not self.slug:
            self.slug = slugify(self.label)[:100]
        super().save(*args, **kwargs)

    @property
    def name(self):
        return self.label

    @staticmethod
    def _lines(value):
        """Split a textarea into bullet lines, ignoring blanks and stray '-'."""
        out = []
        for raw in (value or '').splitlines():
            line = raw.strip().lstrip('-•*').strip()
            if line:
                out.append(line)
        return out

    @property
    def material_lines(self):
        return self._lines(self.materials_text)

    @property
    def casting_session_lines(self):
        return self._lines(self.casting_session_text)

    @property
    def final_delivery_lines(self):
        return self._lines(self.final_delivery_text)

    @property
    def casting_types(self):
        """Filter tabs for this category, derived from its own products.

        Nothing to configure: a tab exists precisely when a product in this
        category uses that type, so tabs can never be empty or missing.
        """
        return (ProductName.objects
                .filter(products__category=self, products__is_active=True)
                .distinct()
                .order_by('position', 'id'))

    def get_display_image(self):
        """Banner image for this category.

        Falls back through: the category's own uploaded image, then the first
        casting model in it, then a shipped placeholder. Lets the studio set a
        proper category banner in admin without breaking the pages today,
        where no Category row has an image yet.
        """
        if self.image:
            return self.image.url
        first_model = self.models.first()
        if first_model:
            return first_model.get_display_image()
        return PLACEHOLDER_IMAGE


class PRICING_TYPES(models.TextChoices):
    # Stored values are unchanged; only what the studio reads is different.
    FLAT = 'flat', 'One price for everyone'
    AGE_TIERS = 'ageTiers', 'Price depends on age'
    SIZE_TIERS = 'sizeTiers', 'Price depends on size'
    FORMULA = 'formula', 'Price calculated per order'


class CastingModel(models.Model):
    category = models.ForeignKey(
        Category, related_name='models', on_delete=models.CASCADE,
        verbose_name='Casting category',
        help_text='Which category page this product appears on.',
    )
    label = models.CharField(
        max_length=200,
        verbose_name='Product name',
        help_text="What is being cast, e.g. '1 Hand + 1 Feet', '2 Hands', '1 Paw'. "
                  'Do not put Table top / Wall hanging here.',
    )
    slug = models.SlugField(max_length=100)
    code = models.CharField(
        max_length=100, blank=True, default='',
        help_text='Generated automatically when you save.',
    )
    # Legacy free-text slug. Superseded by casting_filter below; retained so
    # existing rows keep rendering until templates move across.
    group = models.CharField(max_length=100, blank=True, default='')
    product_name = models.ForeignKey(
        'ProductName',
        null=True, blank=True,
        related_name='products',
        on_delete=models.PROTECT,
        verbose_name='Product name',
        help_text='Only the names offered by the chosen category are listed.',
    )
    casting_type = models.ForeignKey(
        'CastingType',
        null=True, blank=True,
        related_name='products',
        on_delete=models.SET_NULL,
        verbose_name='Number of castings',
        help_text='Manage the list under Casting counts. Use + to add a new one.',
    )
    class BADGE(models.TextChoices):
        BESTSELLER = 'BESTSELLER', 'Bestseller'
        NEW = 'NEW', 'New'
        POPULAR = 'POPULAR', 'Popular'
        TRENDING = 'TRENDING', 'Trending'
        FAMILY_FAVORITE = 'FAMILY FAVORITE', 'Family favourite'
        WEDDING_KEEPSAKE = 'WEDDING KEEPSAKE', 'Wedding keepsake'
        LUXURY = 'LUXURY JEWELLERY', 'Luxury jewellery'
        BLESSINGS = 'BLESSINGS', 'Blessings'

    badge = models.CharField(
        max_length=50, blank=True, default='',
        choices=BADGE.choices,
        verbose_name='Highlight tag',
        help_text='Small label shown on the photo. Leave blank for none.',
    )
    description = models.TextField(
        blank=True, default='',
        verbose_name='Description',
        help_text='A short paragraph about this product.',
    )
    image = OptimizedImageField(
        upload_to='models/', blank=True, null=True,
        verbose_name='Photo',
        help_text='Resized and converted automatically. Any size is fine.',
    )
    image_url = models.CharField(max_length=500, blank=True, default='')
    variant_type = models.CharField(
        max_length=50,
        choices=[('standard', 'Standard'), ('customized', 'Customized'), ('deluxe', 'Deluxe')],
        default='standard',
        verbose_name='Variant',
    )
    customization_note = models.TextField(blank=True, default='')
    position = models.IntegerField(
        default=0,
        verbose_name='Display order',
        help_text='Lower numbers appear first within the category.',
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name='Show on website',
        help_text='Untick to hide this product without deleting it.',
    )
    is_featured = models.BooleanField(
        default=False,
        verbose_name='Show on homepage',
        help_text='Featured in the Best-sellers row on the home page.',
    )
    pricing_type = models.CharField(
        max_length=20, choices=PRICING_TYPES.choices, default=PRICING_TYPES.FLAT,
        verbose_name='How is it priced?',
        help_text='If the price depends on age or size, fill in the Price options '
                  'table at the bottom instead of the boxes below.',
    )
    flat_price = models.PositiveIntegerField(
        null=True, blank=True,
        verbose_name='Price',
        help_text='What the customer pays, in rupees. Numbers only — e.g. 6500',
    )
    flat_strike_price = models.PositiveIntegerField(
        null=True, blank=True,
        verbose_name='Original price',
        help_text='Optional. A higher price shown crossed out beside it, to '
                  'highlight the saving — e.g. 7500. Leave blank if not on offer.',
    )
    formula_text = models.CharField(
        max_length=250, blank=True, default='',
        verbose_name='Pricing note',
        help_text="Only for \"Formula\", e.g. 'Gold rate + 3% GST + 18% wastage'.",
    )
    pricing_config = models.JSONField(default=dict, blank=True)
    rating = models.FloatField(
        default=5.0,
        verbose_name='Star rating shown',
        help_text='Displayed on the product card. Not calculated from real reviews.',
    )
    review_count = models.IntegerField(
        default=24,
        verbose_name='Review count shown',
        help_text='Displayed next to the rating. Not calculated from real reviews.',
    )
    preservation_note = models.TextField(
        blank=True, default='',
        verbose_name='Care note',
        help_text='Shown on the product page under "Preservation note".',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['position', 'id']
        unique_together = ('category', 'slug')
        verbose_name = 'Casting product'
        verbose_name_plural = 'Casting products'

    def __str__(self):
        return f"{self.category.label} — {self.label}"

    def save(self, *args, **kwargs):
        # The dropdown is the source of truth; label is kept in sync so slugs,
        # templates and __str__ carry on working unchanged.
        if self.product_name_id:
            self.label = self.product_name.label
        if not self.slug:
            self.slug = self._unique_slug()
        super().save(*args, **kwargs)
        # Derived from the primary key, which Postgres never reuses. Counting
        # existing rows would hand a deleted product's code to the next one,
        # so an old invoice quoting LCS-BABY-002 would later resolve to a
        # different product. The pk is only available after the first insert,
        # hence the follow-up write.
        if not self.code:
            self.code = self._build_code()
            super().save(update_fields=['code'])

    def _unique_slug(self):
        """A slug that is unique within the category.

        The slug is derived, not typed, so it never reaches the form — which
        means Django cannot validate the (category, slug) constraint and the
        save used to fail with a database error instead of a message. Two
        products in one category legitimately share a name (the same casting
        offered as a Table top and as a Wall hanging), so a suffix is added
        rather than refusing the save.
        """
        base = slugify(self.label)[:90] or 'product'
        candidate = base
        n = 1
        siblings = CastingModel.objects.filter(category=self.category)
        if self.pk:
            siblings = siblings.exclude(pk=self.pk)
        while siblings.filter(slug=candidate).exists():
            n += 1
            candidate = f'{base}-{n}'
        return candidate

    def _build_code(self):
        """A readable, permanently unique SKU, e.g. LCS-BABY-014."""
        prefix = slugify(self.category.label).upper().replace('-', '')[:4] or 'GEN'
        return f'LCS-{prefix}-{self.pk:03d}'

    @property
    def name(self):
        return self.label

    def get_display_image(self):
        if self.image:
            return self.image.url
        if self.image_url:
            return self.image_url
        return PLACEHOLDER_IMAGE

    @property
    def all_photos(self):
        """Main photo first, then the gallery — what the product page loops over."""
        photos = [{'url': self.get_display_image(), 'caption': self.label}]
        photos += [{'url': g.image.url, 'caption': g.caption or self.label}
                   for g in self.gallery.all() if g.image]
        return photos

    @property
    def type_label(self):
        """Short label for what kind of casting this is.

        Prefers the model's own filter group ("2 Casting", "4 Casting"),
        resolved to the human label the category defines rather than the raw
        slug. Only 4 of 21 models currently carry a group, so it falls back to
        the category name, which is always set — otherwise most cards would
        show an empty slot.
        """
        if self.casting_type_id:
            return self.casting_type.label
        if self.group:
            for f in (self.category.filters or []):
                if f.get('slug') == self.group and f.get('label'):
                    return f['label']
            return self.group.replace('-', ' ').title()
        return self.category.label

    @property
    def starting_price(self):
        """Cheapest price row. One row = a single price, two = priced by age."""
        cheapest = self.price_tiers.order_by('price').first()
        return cheapest.price if cheapest else None

    @property
    def strike_price(self):
        cheapest = self.price_tiers.order_by('price').first()
        return cheapest.strike_price if cheapest else None

    @property
    def savings_amount(self):
        if self.starting_price and self.strike_price and self.strike_price > self.starting_price:
            return self.strike_price - self.starting_price
        return None


class ContactMessage(models.Model):
    class LEAD_STATUS(models.TextChoices):
        NEW = 'new', 'New Lead'
        CONTACTED = 'contacted', 'Contacted'
        BOOKED = 'booked', 'Session Booked'
        CLOSED = 'closed', 'Closed'

    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=50)
    email = models.EmailField(blank=True, default='')
    subject = models.CharField(max_length=250, blank=True, default='')
    message = models.TextField()
    status = models.CharField(max_length=20, choices=LEAD_STATUS.choices, default=LEAD_STATUS.NEW)
    studio_notes = models.TextField(blank=True, default='', help_text="Internal studio notes on customer lead")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Contact Lead / Inquiry'
        verbose_name_plural = 'Contact Leads / Inquiries'

    def __str__(self):
        return f"Lead #{self.id} — {self.name} ({self.phone})"


class HeroImage(models.Model):
    image = OptimizedImageField(upload_to='hero/', blank=True, null=True)
    src = models.CharField(max_length=500, blank=True, default='')
    title = models.CharField(max_length=200, default='Lifecasting Studio')
    subtitle = models.CharField(max_length=300, blank=True, default='Preserve your memories forever')
    position = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['position', 'id']
        verbose_name = 'Hero Carousel Image'
        verbose_name_plural = 'Hero Carousel Images'

    def __str__(self):
        return f"Hero Image #{self.id} ({self.title})"

    def get_display_image(self):
        if self.image:
            return self.image.url
        return self.src or PLACEHOLDER_IMAGE


class GalleryImage(models.Model):
    image = OptimizedImageField(upload_to='gallery/', blank=True, null=True)
    src = models.CharField(max_length=500, blank=True, default='')
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=100, blank=True, default='', help_text="Filter category slug e.g. 'baby-2'")
    position = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['position', 'id']
        verbose_name = 'Gallery Portfolio Image'
        verbose_name_plural = 'Gallery Portfolio Images'

    def __str__(self):
        return self.title

    def get_display_image(self):
        if self.image:
            return self.image.url
        return self.src or PLACEHOLDER_IMAGE


class Testimonial(models.Model):
    name = models.CharField(max_length=200)
    quote = models.TextField()
    rating = models.IntegerField(default=5)
    category = models.CharField(max_length=100, default='Baby Casting')
    review_href = models.URLField(blank=True, default='')
    avatar_url = models.URLField(blank=True, default='')
    position = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['position', 'id']
        verbose_name = 'Customer Review'
        verbose_name_plural = 'Customer Reviews'

    def __str__(self):
        return f"{self.name} ({self.rating}★)"


class Faq(models.Model):
    question = models.CharField(max_length=300)
    answer = models.TextField()
    position = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['position', 'id']
        verbose_name = 'FAQ'
        verbose_name_plural = 'FAQs'

    def __str__(self):
        return self.question


class SiteSettings(models.Model):
    whatsapp_number = models.CharField(max_length=50, default='916383893672')
    announcement_bar = models.CharField(
        max_length=300,
        default='🚚 Doorstep Casting Sessions Available in Bangalore • Book Your Slot Today'
    )
    booking_message_template = models.TextField(
        default='Hi! I\'d like to book "{{modelLabel}}" under {{categoryLabel}}. Please share more details.'
    )
    price_disclaimer = models.TextField(
        default='All prices are in Indian Rupees (INR). Final pricing may vary based on customization.'
    )
    view_all_reviews_href = models.URLField(
        default='https://www.google.com/search?q=Lifecasting+studio+Reviews'
    )
    shipping_policy = models.TextField(blank=True, default='')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Site Settings'
        verbose_name_plural = 'Site Settings'

    @classmethod
    def get_solo(cls):
        obj, _ = cls.objects.get_or_create(id=1)
        return obj

    def __str__(self):
        return "Global Site Settings"


class FooterSettings(models.Model):
    tagline = models.TextField(
        default='Preserve your precious memories forever with our expert lifecasting services. Safe, professional, and beautifully crafted keepsakes.'
    )
    safety_title = models.CharField(max_length=200, default='Safety First')
    safety_text = models.TextField(
        default='We use only safe, non-toxic materials suitable for babies and sensitive skin. Your comfort and safety are our top priorities.'
    )
    phone = models.CharField(max_length=50, default='+91 63838 93672')
    phone_href = models.CharField(max_length=100, default='tel:+916383893672')
    email = models.EmailField(default='lifecastingstudio.blr@gmail.com')
    address_line1 = models.CharField(max_length=200, default='1st floor, 213, 1st Main Rd')
    address_line2 = models.CharField(max_length=200, default='AECS Layout - A Block')
    address_line3 = models.CharField(max_length=200, default='Marathahalli, Bengaluru 560037')
    business_hours = models.JSONField(
        default=list,
        help_text="List of dicts: [{'label': 'Monday - Saturday', 'hours': '10:00 AM - 8:00 PM'}]"
    )
    social_links = models.JSONField(
        default=list,
        help_text="List of dicts: [{'label': 'Instagram', 'href': '...', 'icon': 'instagram'}]"
    )
    privacy_href = models.CharField(max_length=200, default='/privacy')
    terms_href = models.CharField(max_length=200, default='/terms')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Footer Settings'
        verbose_name_plural = 'Footer Settings'

    @classmethod
    def get_solo(cls):
        obj, _ = cls.objects.get_or_create(id=1)
        return obj

    def __str__(self):
        return "Footer Settings"


# ============================================================
# EDITABLE LISTS
# ------------------------------------------------------------
# These replace the JSONFields above. Each one was previously a blob the
# studio had to hand-type, e.g.
#
#   Category.filters -> [{"slug": "2-casting", "label": "2 Casting"}]
#
# As real rows they render as inline forms in admin: click "Add another",
# fill the boxes, drag to reorder. A missing brace can no longer take a page
# down, and CastingModel.casting_group can be a dropdown instead of a string
# that has to match a slug buried inside someone else's JSON.
#
# The JSON fields are still present while templates are migrated across.
# ============================================================


class OrderedMixin(models.Model):
    """Shared ordering + the position column every one of these needs."""

    position = models.IntegerField(
        default=0,
        verbose_name='Display order',
        help_text='Lower numbers appear first.',
    )

    class Meta:
        abstract = True
        ordering = ['position', 'id']


class CategoryMaterial(OrderedMixin):
    """One bullet under 'Safe & certified materials'."""

    #: Pre-filled on a new category — the studio standard for every casting.
    DEFAULTS = (
        'Baby skin safe material',
        'Completely organic and non-toxic',
        'Life of the casting will be long lasting',
    )

    category = models.ForeignKey(Category, related_name='material_items', on_delete=models.CASCADE)
    text = models.CharField(
        max_length=300,
        verbose_name='Material used',
        help_text='One point per row.',
    )

    class Meta(OrderedMixin.Meta):
        verbose_name = 'Material'
        verbose_name_plural = 'Materials'

    def __str__(self):
        return self.text[:60]

    def save(self, *args, **kwargs):
        if not self.position:
            last = (CategoryMaterial.objects
                    .filter(category=self.category)
                    .exclude(pk=self.pk)
                    .order_by('-position')
                    .values_list('position', flat=True)
                    .first())
            self.position = (last or 0) + 1
        super().save(*args, **kwargs)


class CategoryDeliveryRule(OrderedMixin):
    """A delivery/turnaround line. `kind` replaces having two JSON fields."""

    class KIND(models.TextChoices):
        CASTING = 'casting', 'Casting session'
        FINAL = 'final', 'Final product delivery'

    #: Pre-filled on a new category, taken from the studio's standard wording.
    #: Edit or clear any line — they are ordinary rows, not fixed text.
    DEFAULTS = (
        (KIND.CASTING, 'For casting: book the slot and visit the studio for casting.'),
        (KIND.CASTING, 'We also provide doorstep service up to 25 km, with a service '
                       'charge of Rs.1000/-'),
        (KIND.CASTING, 'Beyond 25 km, transport charges apply.'),
        (KIND.FINAL,   'Once you provide all the details — photos, baby details — it '
                       'takes 3 to 4 weeks for product delivery.'),
        (KIND.FINAL,   'Collect the final product from the studio, or book a porter.'),
    )

    category = models.ForeignKey(Category, related_name='delivery_rules', on_delete=models.CASCADE)
    kind = models.CharField(
        max_length=20,
        choices=KIND.choices,
        default=KIND.FINAL,
        verbose_name='Applies to',
    )
    text = models.TextField(
        verbose_name='Detail',
        help_text='One rule per row.',
    )

    class Meta(OrderedMixin.Meta):
        verbose_name = 'Delivery rule'
        verbose_name_plural = 'Delivery rules'

    def __str__(self):
        return f'{self.get_kind_display()}: {self.text[:45]}'

    def save(self, *args, **kwargs):
        if not self.position:
            last = (CategoryDeliveryRule.objects
                    .filter(category=self.category)
                    .exclude(pk=self.pk)
                    .order_by('-position')
                    .values_list('position', flat=True)
                    .first())
            self.position = (last or 0) + 1
        super().save(*args, **kwargs)


class CategoryPreservation(OrderedMixin):
    """A care/preservation instruction."""

    category = models.ForeignKey(Category, related_name='preservation_items', on_delete=models.CASCADE)
    text = models.TextField(verbose_name='Instruction', help_text='One instruction per row.')

    class Meta(OrderedMixin.Meta):
        verbose_name = 'Preservation instruction'
        verbose_name_plural = 'Preservation instructions'

    def __str__(self):
        return self.text[:60]


class PriceTier(OrderedMixin):
    """One price row for a product, tagged with the age band it applies to.

    There is no pricing "mode" to choose: a product with a single price has
    one row, a product priced by age has two.
    """

    class AGE_BAND(models.TextChoices):
        UPTO_6 = '0-6', '0 to 6 months'
        OVER_6 = '6+', 'Above 6 months'
        # For products priced the same regardless of age — most categories
        # outside Baby Casting. Use a single row with this selected.
        STANDARD = 'standard', 'Standard Price'

    casting_model = models.ForeignKey(CastingModel, related_name='price_tiers', on_delete=models.CASCADE)
    label = models.CharField(
        max_length=120,
        choices=AGE_BAND.choices,
        default=AGE_BAND.STANDARD,
        verbose_name='Applies to',
        help_text='Standard Price for one price at any age. Use the age bands '
                  'only where the price differs, as in Baby Casting.',
    )
    price = models.PositiveIntegerField(
        verbose_name='Price',
        help_text='In rupees. Numbers only — e.g. 6500',
    )
    strike_price = models.PositiveIntegerField(
        null=True, blank=True,
        verbose_name='Original price',
        help_text='Optional. Crossed out beside the price — e.g. 7500',
    )

    class Meta(OrderedMixin.Meta):
        verbose_name = 'Price option'
        verbose_name_plural = 'Price options'

    def __str__(self):
        return f'{self.get_label_display()} — ₹{self.price}'


class BusinessHour(OrderedMixin):
    """A line in the footer's opening hours."""

    label = models.CharField(
        max_length=120,
        verbose_name='Days',
        help_text="e.g. 'Monday - Saturday'.",
    )
    hours = models.CharField(
        max_length=120,
        verbose_name='Hours',
        help_text="e.g. '10:00 AM - 8:00 PM'.",
    )

    class Meta(OrderedMixin.Meta):
        verbose_name = 'Opening hours'
        verbose_name_plural = 'Opening hours'

    def __str__(self):
        return f'{self.label}: {self.hours}'


class SocialLink(OrderedMixin):
    """A social icon in the footer. Icon is a dropdown, not a typed string —
    only these three are drawn in the template."""

    class ICON(models.TextChoices):
        INSTAGRAM = 'instagram', 'Instagram'
        FACEBOOK = 'facebook', 'Facebook'
        EMAIL = 'email', 'Email'

    label = models.CharField(max_length=60, verbose_name='Name')
    href = models.URLField(max_length=500, verbose_name='Link')
    icon = models.CharField(
        max_length=30,
        choices=ICON.choices,
        default=ICON.INSTAGRAM,
        verbose_name='Icon',
        help_text='Only these icons exist in the design.',
    )

    class Meta(OrderedMixin.Meta):
        verbose_name = 'Social link'
        verbose_name_plural = 'Social links'

    def __str__(self):
        return self.label


class CastingType(OrderedMixin):
    """How many castings a product contains, e.g. '2 Casting'.

    A single global list, managed on its own admin page — the same type means
    the same thing in every category. Products point here directly, and a
    category page derives its filter tabs from whichever types its own
    products use, so there is nothing to configure per category.
    """

    label = models.CharField(
        max_length=120,
        unique=True,
        verbose_name='Casting count',
        help_text="How many hands/feet/paws are cast, e.g. '2 Casting'. "
                  'Shown as a filter tab and on the product card.',
    )
    slug = models.SlugField(
        max_length=120,
        blank=True,
        help_text='Filled in automatically.',
    )

    class Meta(OrderedMixin.Meta):
        verbose_name = 'Casting count'
        verbose_name_plural = 'Casting counts'

    def __str__(self):
        return self.label

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.label)[:120]
        super().save(*args, **kwargs)


class ProductName(OrderedMixin):
    """What a customer is actually buying, e.g. '2 Casting' or 'Table top'.

    A shared vocabulary: six categories all sell 'Table top (Display box)' and
    'Wall hanging (Frame type)', so the name is defined once here and each
    category declares which ones it offers. The product form then shows only
    the names valid for the chosen category.
    """

    label = models.CharField(
        max_length=150,
        unique=True,
        verbose_name='Product name',
        help_text="e.g. '2 Casting', 'Table top (Display box)', 'Gold'.",
    )
    slug = models.SlugField(max_length=150, blank=True, help_text='Filled in automatically.')

    class Meta(OrderedMixin.Meta):
        verbose_name = 'Product name'
        verbose_name_plural = 'Product names'

    def __str__(self):
        return self.label

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.label)[:150]
        super().save(*args, **kwargs)


class ProductImage(OrderedMixin):
    """Extra photos for a product, shown as a gallery beside the main image.

    The product's own `image` stays the primary one — these are the additional
    angles and detail shots. Each upload goes through OptimizedImageField, so a
    phone photo is resized, converted to WebP and stripped of location data on
    the way in.
    """

    casting_model = models.ForeignKey(
        CastingModel, related_name='gallery', on_delete=models.CASCADE)
    image = OptimizedImageField(
        upload_to='products/',
        verbose_name='Photo',
        help_text='Resized and converted automatically. Any size is fine.',
    )
    caption = models.CharField(
        max_length=200, blank=True, default='',
        verbose_name='Describe the photo',
        help_text='Optional. Read aloud by screen readers, e.g. '
                  "'Close-up of the engraved name plate'.",
    )

    class Meta(OrderedMixin.Meta):
        verbose_name = 'Photo'
        verbose_name_plural = 'More photos'

    def __str__(self):
        return self.caption or f'Photo {self.position}'

    def save(self, *args, **kwargs):
        if not self.position:
            last = (ProductImage.objects
                    .filter(casting_model=self.casting_model)
                    .exclude(pk=self.pk)
                    .order_by('-position')
                    .values_list('position', flat=True)
                    .first())
            self.position = (last or 0) + 1
        super().save(*args, **kwargs)
