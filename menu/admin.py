from django.contrib import admin
from .models import Category, Dish

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "order")
    ordering = ("order",)

@admin.register(Dish)
class DishAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "price", "is_available")
    list_filter = ("category", "is_available")
    search_fields = ("title", "description")