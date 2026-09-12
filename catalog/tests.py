from django.test import TestCase, Client
from django.urls import reverse
from catalog.models import Category, CastingModel, SiteSettings


class CatalogViewsTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.category = Category.objects.create(
            slug='baby-casting',
            label='Baby Casting',
            position=0
        )
        self.model = CastingModel.objects.create(
            category=self.category,
            slug='1-hand-1-feet-standard',
            label='1 Hand + 1 Feet Standard',
            pricing_type='ageTiers',
            pricing_config={
                'tiers': [
                    {'label': '0 to 1 year', 'price': 6500},
                    {'label': '1 year and above', 'price': 8500}
                ]
            }
        )
        SiteSettings.get_solo()

    def test_home_page_status_code(self):
        response = self.client.get(reverse('catalog:home'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Lifecasting Studio')

    def test_category_detail_page(self):
        response = self.client.get(reverse('catalog:category_detail', kwargs={'category_slug': 'baby-casting'}))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Baby Casting')

    def test_product_detail_page(self):
        response = self.client.get(reverse('catalog:product_detail', kwargs={'category_slug': 'baby-casting', 'model_slug': '1-hand-1-feet-standard'}))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, '1 Hand + 1 Feet Standard')

    def test_contact_page(self):
        response = self.client.get(reverse('catalog:contact'))
        self.assertEqual(response.status_code, 200)

    def test_contact_form_submission(self):
        from catalog.models import ContactMessage
        data = {
            'name': 'Ananya Roy',
            'phone': '+91 98765 43210',
            'email': 'ananya@example.com',
            'subject': 'Baby Impression',
            'message': 'Looking for a 2-hand casting session.'
        }
        response = self.client.post(reverse('catalog:contact'), data)
        self.assertEqual(response.status_code, 302)
        self.assertEqual(ContactMessage.objects.count(), 1)
        lead = ContactMessage.objects.first()
        self.assertEqual(lead.name, 'Ananya Roy')
        self.assertEqual(lead.status, 'new')

    def test_shipping_policy_page(self):
        response = self.client.get(reverse('catalog:shipping_policy'))
        self.assertEqual(response.status_code, 200)

    def test_faq_help_center_page(self):
        response = self.client.get(reverse('catalog:faq_help_center'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Help Center & Frequently Asked Questions')
        self.assertContains(response, '1. Most common questions')

