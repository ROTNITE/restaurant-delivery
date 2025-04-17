from rest_framework import viewsets
from .models import Dish
from .serializers import DishSerializer

class DishViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Dish.objects.filter(is_available=True).order_by("category", "title")
    serializer_class = DishSerializer