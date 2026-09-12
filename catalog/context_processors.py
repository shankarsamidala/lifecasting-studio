from .models import Category, SiteSettings, FooterSettings


def global_site_context(request):
    return {
        'all_categories': Category.objects.filter(is_active=True).order_by('position', 'id'),
        'site_settings': SiteSettings.get_solo(),
        'footer_settings': FooterSettings.get_solo(),
    }
