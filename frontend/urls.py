# frontend/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('',               views.home,          name='home'),
    path('/promo', views.promo, name='promo'),
    path('/delivery', views.delivery, name='delivery'),
    path('/about-us', views.aboutus, name='aboutus'),
    path('/contacts', views.contacts, name='contacts'),
]
