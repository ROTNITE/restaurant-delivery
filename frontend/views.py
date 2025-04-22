# frontend/views.py
from django.shortcuts import render
from django.db.models import Prefetch
from menu.models import Category, Dish

def home(request):
    return render(request, 'index.html')

def menu(request):
    # Загружаем категории в порядке поля `order`
    # и предзагружаем только доступные блюда в атрибут `available_dishes`
    categories = Category.objects.order_by('order').prefetch_related(
        Prefetch(
            'dishes',
            queryset=Dish.objects.filter(is_available=True).order_by('sequence_number'),
            to_attr='available_dishes'
        )
    )
    return render(request, 'menu.html', {
        'categories': categories,
        'menu_page': True,
    })

def promo(request):
    return render(request, 'promo.html')

def delivery(request):
    return render(request, 'delivery.html')

def aboutus(request):
    return render(request, 'aboutus.html')

def contacts(request):
    return render(request, 'contacts.html')