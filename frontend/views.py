# frontend/views.py
from django.shortcuts import render
from menu.models import Category

def home(request):
    return render(request, 'home.html')

def menu(request):
    # Предзагружаем все связанные блюда через related_name='dishes'
    categories = Category.objects.prefetch_related('dishes').all()
    return render(request, 'menu.html', {
        'categories': categories,
        'menu_page': True,
    })

def promo(request):
    return render(request, 'promo.html')

def delivery(request):
    return render(request, 'delivery.html')

def contacts(request):
    return render(request, 'contacts.html')

def terms(request):
    return render(request, 'agreement.html')

def order_success(request):
    return render(request, 'order_success.html')
