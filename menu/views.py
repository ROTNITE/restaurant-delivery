from rest_framework import viewsets
from .models import Dish
from .serializers import DishSerializer
from django.views.generic import ListView
from .models import Category

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
