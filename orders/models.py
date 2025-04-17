import os
import requests
from django.db import models
from django.core.mail import send_mail
from django.template.loader import render_to_string

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
        # Отправка email
        subject = f"Новый заказ #{self.id}"
        message = render_to_string(
            "orders/emails/new_order.txt", {"order": self}
        )
        from_email = os.getenv('SMTP_USER')
        recipient_list = [os.getenv('ADMIN_EMAIL')]
        send_mail(subject, message, from_email, recipient_list)

        # Отправка в Telegram
        token = os.getenv('TELEGRAM_BOT_TOKEN')
        chat_id = os.getenv('TELEGRAM_CHAT_ID')
        text = (
            f"{subject}\n"
            f"Клиент: {self.full_name}\n"
            f"Телефон: {self.phone}\n"
            f"Адрес: {self.address}\n"
            f"Позиции: {self.items}"
        )
        requests.get(
            f"https://api.telegram.org/bot{token}/sendMessage",
            params={"chat_id": chat_id, "text": text},
        )
