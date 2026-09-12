"""Build the FilterPreset vocabulary from existing tab names and link them."""
from django.db import migrations
from django.utils.text import slugify


def forwards(apps, schema_editor):
    CategoryFilter = apps.get_model('catalog', 'CategoryFilter')
    FilterPreset = apps.get_model('catalog', 'FilterPreset')

    seeded = ['1 Casting', '2 Casting', '3 Casting', '4 Casting', '6 Casting']
    existing = [l for l in CategoryFilter.objects.values_list('label', flat=True) if l]
    for i, label in enumerate(dict.fromkeys(seeded + existing)):
        FilterPreset.objects.get_or_create(
            label=label,
            defaults={'slug': slugify(label), 'position': i + 1},
        )

    for cf in CategoryFilter.objects.filter(preset__isnull=True):
        if cf.label:
            cf.preset = FilterPreset.objects.filter(label=cf.label).first()
            cf.save(update_fields=['preset'])


def backwards(apps, schema_editor):
    apps.get_model('catalog', 'CategoryFilter').objects.update(preset=None)


class Migration(migrations.Migration):
    dependencies = [('catalog', '0007_filterpreset_alter_categoryfilter_label_and_more')]
    operations = [migrations.RunPython(forwards, backwards)]
