from django.contrib import admin
from .models import Order

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "full_name", "phone", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("full_name", "phone", "address")
    readonly_fields = ("created_at",)
