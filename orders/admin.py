from django.contrib import admin
from .models import Order, NotificationSettings, SMTPSettings

@admin.register(SMTPSettings)
class SMTPSettingsAdmin(admin.ModelAdmin):
    list_display = ("username", "host", "port", "use_tls")

@admin.register(NotificationSettings)
class NotificationSettingsAdmin(admin.ModelAdmin):
    list_display  = ("email_address", "telegram_token", "telegram_chat_id")
    # Можно добавить readonly_fields или поиск, если нужно

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display    = ("id", "full_name", "phone", "status", "created_at")
    list_filter     = ("status", "created_at")
    search_fields   = ("full_name", "phone", "address")
    readonly_fields = ("created_at",)

    # Если хотите прямо из админки вручную послать уведомление, можно добавить action:
    actions = ["send_notification"]

    def send_notification(self, request, queryset):
        for order in queryset:
            order.notify_admin()
        self.message_user(request, "Уведомления отправлены")
    send_notification.short_description = "Отправить уведомления для выбранных заказов"
