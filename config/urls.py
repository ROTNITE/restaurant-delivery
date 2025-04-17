# config/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/',          admin.site.urls),
    path('api/menu/',       include('menu.urls')),
    path('api/orders/',     include('orders.urls')),
    path('',                include('frontend.urls')),  # всё, что в frontend/urls.py
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
