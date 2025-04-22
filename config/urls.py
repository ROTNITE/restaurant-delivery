# config/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from menu.views import promo_list

urlpatterns = [
    path('admin/',          admin.site.urls),
    path('api/menu/',       include('menu.urls')),
    path('api/orders/',     include('orders.urls')),
    path('promo/', promo_list, name='promo'),
    path('', include('frontend.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
