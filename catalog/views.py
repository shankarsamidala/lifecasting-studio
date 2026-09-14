import urllib.parse
from django.db.models import Q
from django.shortcuts import render, get_object_or_404, redirect
from .models import (
    Category,
    CastingModel,
    ContactMessage,
    HeroImage,
    GalleryImage,
    Testimonial,
    Faq,
    SiteSettings,
)


def home(request):
    hero_images = HeroImage.objects.all()
    gallery_images = GalleryImage.objects.all()
    testimonials = Testimonial.objects.all()
    faqs = Faq.objects.all()
    # Curate top 4 featured models to reduce cognitive load on home page
    featured_models = CastingModel.objects.exclude(badge__isnull=True).exclude(badge__exact='')[:4]
    if not featured_models:
        featured_models = CastingModel.objects.all()[:4]

    # Products with highlight tag 'NEW' only, newest first — for the New Arrivals section above categories
    all_models = CastingModel.objects.filter(badge__iexact='NEW').select_related('category').order_by('-id')

    context = {
        'hero_images': hero_images,
        'all_models': all_models,
        'gallery_images': gallery_images,
        'testimonials': testimonials,
        'faqs': faqs,
        'featured_models': featured_models,
    }
    return render(request, 'catalog/home.html', context)


def category_detail(request, category_slug):
    category = get_object_or_404(Category, slug=category_slug)
    models_qs = category.models.filter(is_active=True).select_related('casting_type')

    # ?group=<casting type slug>, as linked from the filter tabs and the menu.
    # The legacy free-text `group` field still matches for older links.
    active_filter = request.GET.get('group') or request.GET.get('filter', '')
    if active_filter:
        models_qs = models_qs.filter(
            Q(casting_type__slug=active_filter) | Q(group=active_filter)
        )

    models_list = list(models_qs)

    sort_param = request.GET.get('sort', '')
    if sort_param == 'price_asc':
        models_list.sort(key=lambda m: (m.starting_price is None, m.starting_price or 0))
    elif sort_param == 'price_desc':
        models_list.sort(key=lambda m: (m.starting_price is None, -(m.starting_price or 0)))

    context = {
        'category': category,
        'models': models_list,
        'active_filter': active_filter,
        'sort_param': sort_param,
    }
    return render(request, 'catalog/category_detail.html', context)


def product_detail(request, category_slug, model_slug):
    category = get_object_or_404(Category, slug=category_slug)
    model_obj = get_object_or_404(CastingModel, category=category, slug=model_slug)
    site_settings = SiteSettings.get_solo()

    related_models = category.models.exclude(id=model_obj.id)[:4]

    # Booking message. The page's JS rebuilds the same text when the visitor
    # picks an age or frame; this server copy is the no-JS fallback and must
    # keep the same wording. build_absolute_uri leaves an already-absolute
    # URL (S3 images) untouched and prefixes the site for /static/ ones.
    product_label = ' '.join(model_obj.label.split())
    product_url = request.build_absolute_uri()
    image_url = request.build_absolute_uri(model_obj.get_display_image())
    booking_text = '\n'.join([
        'Hello Lifecasting Studio,',
        '',
        "I'd like to book the following:",
        '',
        f'• Product: {product_label}',
        f'• Category: {category.label}',
        f'• Product code: {model_obj.code}',
        '',
        f'Product link: {product_url}',
        f'Photo: {image_url}',
        '',
        'Could you please share the availability and next steps?',
        '',
        'Thank you.',
    ])
    whatsapp_link = f"https://wa.me/{site_settings.whatsapp_number}?text={urllib.parse.quote(booking_text)}"

    context = {
        'category': category,
        'model': model_obj,
        'related_models': related_models,
        'whatsapp_link': whatsapp_link,
        'product_label': product_label,
        'product_url': product_url,
        'image_url': image_url,
    }
    return render(request, 'catalog/product_detail.html', context)


def contact(request):
    site_settings = SiteSettings.get_solo()
    if request.method == 'POST':
        name = request.POST.get('name', '').strip()
        phone = request.POST.get('phone', '').strip()
        email = request.POST.get('email', '').strip()
        subject = request.POST.get('subject', '').strip()
        message = request.POST.get('message', '').strip()

        if name and phone:
            ContactMessage.objects.create(
                name=name,
                phone=phone,
                email=email,
                subject=subject,
                message=message,
            )

        msg = f"Hi! I'd like to get in touch.\nName: {name}\nPhone: {phone}\nEmail: {email}\nSubject: {subject}\nMessage: {message}"
        wa_url = f"https://wa.me/{site_settings.whatsapp_number}?text={urllib.parse.quote(msg)}"
        return redirect(wa_url)

    return render(request, 'catalog/contact.html')


def shipping_policy(request):
    return render(request, 'catalog/shipping_policy.html')


def faq_help_center(request):
    faqs = Faq.objects.all()
    context = {
        'faqs': faqs,
    }
    return render(request, 'catalog/faq.html', context)


def privacy_policy(request):
    return render(request, 'catalog/privacy.html')


def terms_of_service(request):
    return render(request, 'catalog/terms.html')
