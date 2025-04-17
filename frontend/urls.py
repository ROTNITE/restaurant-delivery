# frontend/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('',               views.home,          name='home'),
    path('menu/',          views.menu,          name='menu'),
    path('promo/',         views.promo,         name='promo'),
    path('delivery/',      views.delivery,      name='delivery'),
    path('contacts/',      views.contacts,      name='contacts'),
    path('agreement/',     views.terms,         name='terms'),       # <-- name должен совпадать с тем, что вы используете в шаблоне
    path('order-success/', views.order_success, name='order_success'),
]
