from django.urls import path
from . import views

app_name = 'catalog'

urlpatterns = [
    path('', views.home, name='home'),
    path('collections/<slug:category_slug>/', views.category_detail, name='category_detail'),
    path('collections/<slug:category_slug>/<slug:model_slug>/', views.product_detail, name='product_detail'),
    path('contact/', views.contact, name='contact'),
    path('faq/', views.faq_help_center, name='faq_help_center'),
    path('pages/shipping-policy/', views.shipping_policy, name='shipping_policy'),
    path('privacy/', views.privacy_policy, name='privacy'),
    path('terms/', views.terms_of_service, name='terms'),
]
