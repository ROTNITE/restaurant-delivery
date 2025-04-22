from rest_framework import viewsets
from .models import Dish
from .serializers import DishSerializer
from django.views.generic import ListView
from .models import Category
from django.shortcuts import render
from .models import Promotion

def promo_list(request):
    banners = Promotion.objects.filter(is_active=True)
    print("DEBUG promo_list:", list(banners))
    return render(request, 'promo.html', {'banners': banners})

# API‑эндпоинт для DRF
class DishViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Dish.objects.filter(is_available=True).order_by("sequence_number")
    serializer_class = DishSerializer

# Web‑view для рендеринга через Django‑шаблоны
class MenuView(ListView):
    model = Category
    template_name = 'menu/menu.html'
    context_object_name = 'categories'

    def get_queryset(self):
        # подтягиваем категории и все блюда внутри них, фильтруя по is_available
        return Category.objects.prefetch_related(
            'dishes'
        ).all().order_by('order')
