"""Admin for Lifecasting Studio.

Written for the studio owner, not a developer. The guiding rules:

* Nothing that can be derived is typed. Slugs and product codes generate
  themselves and are shown read-only.
* Nothing that must match another value is free text. "Type of casting" is a
  dropdown fed by the category's own filter tabs.
* No JSON. Lists that used to be hand-typed blobs are inline rows.
* Every field has a plain-English label and says what it is for.
"""

from django.contrib import admin
from django.utils.html import format_html

from .models import (
    BusinessHour,
    Category,
    CategoryDeliveryRule,
    CastingType,
    CategoryMaterial,
    ProductName,
    CategoryPreservation,
    CastingModel,
    ContactMessage,
    Faq,
    FooterSettings,
    GalleryImage,
    HeroImage,
    PriceTier,
    ProductImage,
    SiteSettings,
    SocialLink,
    Testimonial,
)

admin.site.site_header = 'Lifecasting Studio'
admin.site.site_title = 'Lifecasting Studio'
admin.site.index_title = 'Manage your website'


def _thumb(obj, size=56):
    """Small preview so rows are recognisable without opening them."""
    url = obj.get_display_image() if hasattr(obj, 'get_display_image') else None
    if not url:
        return '—'
    return format_html(
        '<img src="{}" style="height:{}px;width:{}px;object-fit:cover;'
        'border-radius:8px;border:1px solid #e5e5e5" />', url, size, size
    )



class HideTechnicalOnAddMixin:
    """Drop the Technical fieldset from the add form.

    On a new record every field in it is blank and auto-filled on save, so
    showing it only invites someone to type into a box that will be
    overwritten. It reappears, read-only, once the record exists.
    """

    def get_fieldsets(self, request, obj=None):
        fieldsets = super().get_fieldsets(request, obj)
        if obj is None:
            return tuple((name, opts) for name, opts in fieldsets
                         if name != 'Technical')
        return fieldsets



class HiddenFromIndexMixin:
    """Registered, but not listed on the admin home page.

    Kept registered rather than unregistered so their URLs still work — the
    green "+" beside a dropdown, inline forms, and any bookmarked link all
    continue to function. Delete the mixin from a class to show it again.
    """

    def get_model_perms(self, request):
        return {}


# ─────────────────────────── inlines ───────────────────────────

class CategoryMaterialInline(admin.TabularInline):
    """Pre-filled with the studio's standard three lines on a new category.

    They are ordinary editable rows, not fixed text — clear one, reword it, or
    add more. Nothing is saved until the category is saved.
    """

    model = CategoryMaterial
    fields = ('text',)          # order follows the order they are added
    verbose_name = 'material'
    verbose_name_plural = 'Materials used  —  shown under "Safe & certified materials"'

    def get_extra(self, request, obj=None, **kwargs):
        # Blank rows to hold the defaults when adding; one spare when editing.
        return len(CategoryMaterial.DEFAULTS) if obj is None else 1

    def get_formset(self, request, obj=None, **kwargs):
        formset = super().get_formset(request, obj, **kwargs)
        if obj is not None:
            return formset

        defaults = [{'text': t} for t in CategoryMaterial.DEFAULTS]

        class PrefilledFormSet(formset):
            def __init__(self, *args, **kw):
                kw.setdefault('initial', defaults)
                super().__init__(*args, **kw)

        return PrefilledFormSet


class CategoryDeliveryRuleInline(admin.TabularInline):
    """Pre-filled with the studio's standard casting-session and final-delivery
    wording on a new category. Ordinary editable rows — reword, clear or add."""

    model = CategoryDeliveryRule
    fields = ('kind', 'text')   # order follows the order they are added
    verbose_name = 'delivery rule'
    verbose_name_plural = (
        'Delivery rules  —  casting session and final delivery, shown on the category page'
    )

    def get_extra(self, request, obj=None, **kwargs):
        return len(CategoryDeliveryRule.DEFAULTS) if obj is None else 1

    def get_formset(self, request, obj=None, **kwargs):
        formset = super().get_formset(request, obj, **kwargs)
        if obj is not None:
            return formset

        defaults = [{'kind': k, 'text': t} for k, t in CategoryDeliveryRule.DEFAULTS]

        class PrefilledFormSet(formset):
            def __init__(self, *args, **kw):
                kw.setdefault('initial', defaults)
                super().__init__(*args, **kw)

        return PrefilledFormSet


class CategoryPreservationInline(admin.TabularInline):
    model = CategoryPreservation
    extra = 1
    fields = ('text', 'position')
    verbose_name_plural = 'Care instructions'


class PriceTierInline(admin.TabularInline):
    """Opens with a single Standard Price row — the common case.

    Only the amount needs typing. For Baby Casting, switch the dropdown to the
    age bands and add a second row.
    """

    model = PriceTier
    fields = ('label', 'price', 'strike_price')
    verbose_name = 'price'

    # One Standard Price row, plus a spare in case the product needs age bands.
    extra = 2

    verbose_name_plural = (
        'Price  —  one Standard Price row, or one row per age band'
    )


class ProductImageInline(admin.TabularInline):
    """Extra photos, with a thumbnail so rows are identifiable once saved."""

    model = ProductImage
    extra = 3
    fields = ('thumb', 'image', 'caption')
    readonly_fields = ('thumb',)
    verbose_name = 'photo'
    verbose_name_plural = (
        'More photos  —  extra angles shown beside the main photo. '
        'Drag-free: they appear in the order added.'
    )

    @admin.display(description='')
    def thumb(self, obj):
        if not obj.pk or not obj.image:
            return '—'
        return format_html(
            '<img src="{}" style="height:52px;width:52px;object-fit:cover;'
            'border-radius:6px;border:1px solid #e5e5e5" />', obj.image.url
        )


# ─────────────────────────── catalogue ───────────────────────────

@admin.register(Category)
class CategoryAdmin(HideTechnicalOnAddMixin, admin.ModelAdmin):
    list_display = ('preview', 'label', 'product_count', 'position', 'is_active')
    list_display_links = ('preview', 'label')
    list_editable = ('position', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('label', 'description')
    readonly_fields = ('slug', 'created_at', 'updated_at')
    ordering = ('position', 'id')

    fieldsets = (
        ('Category', {
            'fields': ('label', 'image', 'warranty'),
            'description': 'The name shown on the site, its banner photo, and the '
                           'warranty line under the heading.',
        }),
        ('Details shown on the category page', {
            'fields': ('materials_text', 'casting_session_text',
                       'final_delivery_text', 'casting_process'),
            'description': 'Type one point per line — each line becomes a bullet '
                           'on the site. No need for dashes or numbering.',
        }),
        ('Visibility', {
            'fields': ('position', 'is_active'),
            'description': 'Lower numbers appear first. Untick to hide it site-wide.',
        }),
        ('Technical', {
            'fields': ('slug', 'created_at', 'updated_at'),
            'classes': ('collapse',),
            'description': 'Filled in automatically. Nothing to edit here.',
        }),
    )

    @admin.display(description='')
    def preview(self, obj):
        return _thumb(obj)

    @admin.display(description='Products')
    def product_count(self, obj):
        return obj.models.count()


@admin.register(CastingModel)
class CastingModelAdmin(HideTechnicalOnAddMixin, admin.ModelAdmin):
    list_display = ('preview', 'label', 'category', 'casting_type',
                    'photo_count', 'price_summary', 'code', 'is_active', 'is_featured')
    list_display_links = ('preview', 'label')
    list_editable = ('is_active', 'is_featured')
    list_filter = ('category', 'is_active', 'is_featured')
    search_fields = ('label', 'code', 'category__label', 'description')
    readonly_fields = ('slug', 'code', 'pricing_config', 'image_url', 'group', 'product_name',
                       'variant_type', 'customization_note', 'pricing_type',
                       'flat_price', 'flat_strike_price', 'formula_text',
                       'created_at', 'updated_at')
    inlines = [ProductImageInline, PriceTierInline]
    ordering = ('category', 'position', 'id')
    autocomplete_fields = ()

    fieldsets = (
        ('What is it?', {
            'fields': ('category', 'casting_type', 'label', 'image', 'description'),
            'description': 'The product name, which category page it belongs to, '
                           'and a photo.',
        }),
        ('Where does it show?', {
            'fields': ('badge', 'is_active', 'is_featured', 'position'),
        }),
        ('Extra details', {
            'fields': ('preservation_note', 'rating', 'review_count'),
            'classes': ('collapse',),
            'description': 'Optional. The rating and review count are display values, '
                           'not calculated from real reviews.',
        }),
        ('Technical', {
            'fields': ('slug', 'code', 'image_url', 'group', 'product_name', 'variant_type',
                       'customization_note', 'pricing_type', 'flat_price',
                       'flat_strike_price', 'formula_text', 'pricing_config',
                       'created_at', 'updated_at'),
            'classes': ('collapse',),
            'description': 'Generated automatically or no longer used. '
                           'Nothing to edit here.',
        }),
    )

    class Media:
        js = ('admin/js/scoped_product_name.js',)

    def render_change_form(self, request, context, *args, **kwargs):
        # {category_id: [allowed product-name ids]} for the client-side filter.
        context['category_product_names'] = {
            str(c.pk): list(c.offered_names.values_list('id', flat=True))
            for c in Category.objects.prefetch_related('offered_names')
        }
        return super().render_change_form(request, context, *args, **kwargs)

    @admin.display(description='')
    def preview(self, obj):
        return _thumb(obj)

    @admin.display(description='Photos')
    def photo_count(self, obj):
        extra = obj.gallery.count()
        return f'1 + {extra}' if extra else ('1' if obj.image or obj.image_url else '—')

    @admin.display(description='Price')
    def price_summary(self, obj):
        tiers = obj.price_tiers.all()
        if tiers:
            return f'from ₹{min(t.price for t in tiers):,} ({len(tiers)} options)'
        if obj.starting_price:
            return f'₹{obj.starting_price:,}'
        return '—'


# ─────────────────────────── content ───────────────────────────

@admin.register(HeroImage)
class HeroImageAdmin(HiddenFromIndexMixin, admin.ModelAdmin):
    list_display = ('preview', 'title', 'subtitle', 'position')
    list_display_links = ('preview', 'title')
    list_editable = ('position',)
    ordering = ('position', 'id')
    fields = ('title', 'subtitle', 'image', 'position')

    @admin.display(description='')
    def preview(self, obj):
        return _thumb(obj)


@admin.register(GalleryImage)
class GalleryImageAdmin(HiddenFromIndexMixin, admin.ModelAdmin):
    list_display = ('preview', 'title', 'category', 'position')
    list_display_links = ('preview', 'title')
    list_editable = ('position',)
    list_filter = ('category',)
    search_fields = ('title', 'category')
    ordering = ('position', 'id')
    fields = ('title', 'category', 'image', 'position')

    @admin.display(description='')
    def preview(self, obj):
        return _thumb(obj)


@admin.register(Testimonial)
class TestimonialAdmin(HiddenFromIndexMixin, admin.ModelAdmin):
    list_display = ('name', 'category', 'rating', 'position')
    list_editable = ('position',)
    list_filter = ('category', 'rating')
    search_fields = ('name', 'quote')
    ordering = ('position', 'id')


@admin.register(Faq)
class FaqAdmin(HiddenFromIndexMixin, admin.ModelAdmin):
    list_display = ('question', 'position')
    list_editable = ('position',)
    search_fields = ('question', 'answer')
    ordering = ('position', 'id')


@admin.register(ContactMessage)
class ContactMessageAdmin(HiddenFromIndexMixin, admin.ModelAdmin):
    list_display = ('name', 'phone', 'subject', 'status', 'created_at')
    list_editable = ('status',)
    list_filter = ('status', 'created_at')
    search_fields = ('name', 'phone', 'email', 'subject', 'message', 'studio_notes')
    readonly_fields = ('name', 'phone', 'email', 'subject', 'message',
                       'created_at', 'updated_at')
    ordering = ('-created_at',)

    fieldsets = (
        ('Enquiry', {
            'fields': ('name', 'phone', 'email', 'subject', 'message', 'created_at'),
            'description': 'Sent by the customer through the website. Read-only.',
        }),
        ('Your follow-up', {
            'fields': ('status', 'studio_notes'),
        }),
    )

    def has_add_permission(self, request):
        # These arrive from the website; adding one by hand would be a mistake.
        return False


# ─────────────────────────── settings ───────────────────────────

class SingletonAdmin(admin.ModelAdmin):
    """One row only — hide Add and Delete so it can't be duplicated."""

    def has_add_permission(self, request):
        return not self.model.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(SiteSettings)
class SiteSettingsAdmin(HiddenFromIndexMixin, SingletonAdmin):
    pass


@admin.register(FooterSettings)
class FooterSettingsAdmin(HiddenFromIndexMixin, SingletonAdmin):
    fieldsets = (
        ('Studio details', {
            'fields': ('tagline', 'phone', 'phone_href', 'email',
                       'address_line1', 'address_line2', 'address_line3'),
        }),
        ('Safety note', {
            'fields': ('safety_title', 'safety_text'),
        }),
        ('Old list fields', {
            'fields': ('business_hours', 'social_links'),
            'classes': ('collapse',),
            'description': (
                'Superseded by "Opening hours" and "Social links" in the sidebar. '
                'Kept only so nothing is lost; edit the new ones instead.'
            ),
        }),
    )


@admin.register(BusinessHour)
class BusinessHourAdmin(HiddenFromIndexMixin, admin.ModelAdmin):
    list_display = ('label', 'hours', 'position')
    list_editable = ('hours', 'position')
    ordering = ('position', 'id')


@admin.register(SocialLink)
class SocialLinkAdmin(HiddenFromIndexMixin, admin.ModelAdmin):
    list_display = ('label', 'icon', 'href', 'position')
    list_editable = ('position',)
    ordering = ('position', 'id')


@admin.register(CastingType)
class CastingTypeAdmin(admin.ModelAdmin):
    """How many castings a product contains: 2, 3, 4. The grouping a product
    sits under within its category — e.g. Baby Casting → 2 Casting →
    1 Hand + 1 Feet."""

    list_display = ('label', 'product_count', 'position')
    list_editable = ('position',)
    search_fields = ('label',)
    readonly_fields = ('slug',)
    ordering = ('position', 'id')
    fields = ('label', 'position', 'slug')

    @admin.display(description='Products using it')
    def product_count(self, obj):
        return obj.products.count()


# ─────────────────────── index ordering ───────────────────────
# Django sorts models alphabetically within an app. That puts "Casting
# categories" above "Casting types", which is backwards — you set up the types
# first, then use them. This pins the order explicitly.

CATALOG_ORDER = ['CastingType', 'Category', 'CastingModel']

_default_get_app_list = admin.site.get_app_list


def _ordered_app_list(request, app_label=None):
    app_list = _default_get_app_list(request, app_label)
    for app in app_list:
        if app.get('app_label') == 'catalog':
            rank = {name: i for i, name in enumerate(CATALOG_ORDER)}
            app['models'].sort(
                key=lambda m: (rank.get(m.get('object_name'), len(rank)),
                               m.get('name', ''))
            )
    return app_list


admin.site.get_app_list = _ordered_app_list


@admin.register(ProductName)
class ProductNameAdmin(HiddenFromIndexMixin, admin.ModelAdmin):
    """The shared vocabulary of product names. Add or remove here and every
    category's list and product dropdown follows."""

    list_display = ('label', 'used_by_categories', 'product_count', 'position')
    list_editable = ('position',)
    search_fields = ('label',)
    readonly_fields = ('slug',)
    ordering = ('position', 'id')
    fields = ('label', 'position', 'slug')

    @admin.display(description='Offered by')
    def used_by_categories(self, obj):
        return obj.categories.count()

    @admin.display(description='Products using it')
    def product_count(self, obj):
        return obj.products.count()
