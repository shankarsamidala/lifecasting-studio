"""Convert the JSON blob fields into real rows.

Runs against whatever data exists; on an empty database it is a no-op. The
JSON columns are left in place so templates can be moved across afterwards
without a flag day.
"""
from django.db import migrations
from django.utils.text import slugify


def forwards(apps, schema_editor):
    Category = apps.get_model('catalog', 'Category')
    CastingModel = apps.get_model('catalog', 'CastingModel')
    Filter = apps.get_model('catalog', 'CategoryFilter')
    Material = apps.get_model('catalog', 'CategoryMaterial')
    Delivery = apps.get_model('catalog', 'CategoryDeliveryRule')
    Preservation = apps.get_model('catalog', 'CategoryPreservation')
    Tier = apps.get_model('catalog', 'PriceTier')
    Hour = apps.get_model('catalog', 'BusinessHour')
    Social = apps.get_model('catalog', 'SocialLink')
    FooterSettings = apps.get_model('catalog', 'FooterSettings')

    for cat in Category.objects.all():
        for i, f in enumerate(cat.filters or []):
            if isinstance(f, dict) and f.get('label'):
                Filter.objects.get_or_create(
                    category=cat, slug=f.get('slug') or slugify(f['label']),
                    defaults={'label': f['label'], 'position': i},
                )
        for i, text in enumerate(cat.materials or []):
            if isinstance(text, str) and text.strip():
                Material.objects.get_or_create(category=cat, text=text, defaults={'position': i})
        for kind, values in (('casting', cat.casting_delivery), ('final', cat.final_delivery)):
            for i, text in enumerate(values or []):
                if isinstance(text, str) and text.strip():
                    Delivery.objects.get_or_create(
                        category=cat, kind=kind, text=text, defaults={'position': i})
        for i, text in enumerate(cat.preservation or []):
            if isinstance(text, str) and text.strip():
                Preservation.objects.get_or_create(category=cat, text=text, defaults={'position': i})

    for m in CastingModel.objects.all():
        cfg = m.pricing_config or {}
        for i, t in enumerate(cfg.get('tiers') or []):
            if isinstance(t, dict) and t.get('label') and t.get('price') is not None:
                Tier.objects.get_or_create(
                    casting_model=m, label=t['label'],
                    defaults={'price': t['price'],
                              'strike_price': t.get('strikePrice'),
                              'position': i},
                )
        # link the legacy group slug to the new filter row
        if m.group and not m.casting_filter_id:
            match = Filter.objects.filter(category=m.category, slug=m.group).first()
            if match:
                m.casting_filter = match
                m.save(update_fields=['casting_filter'])

    footer = FooterSettings.objects.first()
    if footer:
        for i, h in enumerate(footer.business_hours or []):
            if isinstance(h, dict) and h.get('label'):
                Hour.objects.get_or_create(
                    label=h['label'], defaults={'hours': h.get('hours', ''), 'position': i})
        for i, s in enumerate(footer.social_links or []):
            if isinstance(s, dict) and s.get('href'):
                Social.objects.get_or_create(
                    href=s['href'],
                    defaults={'label': s.get('label', ''),
                              'icon': s.get('icon', 'instagram'),
                              'position': i},
                )


def backwards(apps, schema_editor):
    """The JSON columns were never cleared, so rolling back just drops rows."""
    for name in ('CategoryFilter', 'CategoryMaterial', 'CategoryDeliveryRule',
                 'CategoryPreservation', 'PriceTier', 'BusinessHour', 'SocialLink'):
        apps.get_model('catalog', name).objects.all().delete()


class Migration(migrations.Migration):
    dependencies = [('catalog', '0005_businesshour_sociallink_alter_castingmodel_code_and_more')]
    operations = [migrations.RunPython(forwards, backwards)]
