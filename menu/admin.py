from django.contrib import admin
from .models import Category, Dish, Promotion

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display    = ("name", "order")
    ordering        = ("order",)

@admin.register(Dish)
class DishAdmin(admin.ModelAdmin):
    list_display    = ("sequence_number", "title", "category", "price", "is_available")
    ordering        = ("sequence_number",)
    list_filter     = ("category", "is_available")
    search_fields   = ("title", "description")
    readonly_fields = ("sequence_number",)

@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display    = ("order", "title", "is_active")
    list_display_links = ("title",)
    list_editable   = ("order", "is_active")
    fields          = ("title", "banner", "is_active", "order")
