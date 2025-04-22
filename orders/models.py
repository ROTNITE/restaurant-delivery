import os
import requests
from django.db import models
from django.core.mail import send_mail
import logging
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)

class Order(models.Model):
    STATUS_NEW = 'new'
    STATUS_IN_PROGRESS = 'in_progress'
    STATUS_DONE = 'done'
    STATUS_CHOICES = [
        (STATUS_NEW, 'Новый'),
        (STATUS_IN_PROGRESS, 'В работе'),
        (STATUS_DONE, 'Выполнен'),
    ]

    full_name = models.CharField("ФИО клиента", max_length=200)
    phone = models.CharField("Телефон", max_length=20)
    address = models.CharField("Адрес доставки", max_length=300)
    items = models.JSONField("Позиции заказа")
    status = models.CharField(
        "Статус", max_length=20, choices=STATUS_CHOICES, default=STATUS_NEW
    )
    created_at = models.DateTimeField(
        "Дата и время создания", auto_now_add=True
    )

    def __str__(self):
        return f"Заказ #{self.id} — {self.full_name}"

    def notify_admin(self):
        subject = f"Новый заказ #{self.id}"
        # Собираем текст вручную или через шаблон
        text_message = (
            f"{subject}\n"
            f"Клиент: {self.full_name}\n"
            f"Телефон: {self.phone}\n"
            f"Адрес: {self.address}\n\n"
            "Позиции:\n" +
            "\n".join(f"- {i['dish']}: {i['quantity']}" for i in self.items)
        )

        try:
            send_mail(
                subject,
                text_message,
                None,  # возьмёт DEFAULT_FROM_EMAIL
                [cfg.email_address],
                fail_silently=False,
            )
        except Exception as e:
            logger.error("Не удалось отправить email-уведомление: %s", e)

        try:
            requests.post(
                f"https://api.telegram.org/bot{cfg.telegram_token}/sendMessage",
                data={'chat_id': cfg.telegram_chat_id, 'text': text_message},
                timeout=5
            )
        except Exception as e:
            logger.error("Не удалось отправить Telegram-уведомление: %s", e)

# orders/models.py
class NotificationSettings(models.Model):
    email_address   = models.EmailField("Email для уведомлений")
    telegram_token  = models.CharField("Telegram Bot Token", max_length=200)
    telegram_chat_id = models.CharField("Telegram Chat ID", max_length=100)

    class Meta:
        verbose_name = "Настройки уведомлений"
        verbose_name_plural = "Настройки уведомлений"

    def __str__(self):
        return "Настройки уведомлений"
