import logging
import requests
from django.db import models
from django.core.mail import get_connection, EmailMessage
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)


class SMTPSettings(models.Model):
    host = models.CharField("SMTP Host", max_length=200, default="smtp.gmail.com")
    port = models.PositiveIntegerField("SMTP Порт", default=587)
    use_tls = models.BooleanField("Использовать TLS", default=True)
    username = models.EmailField("SMTP Логин")
    password = models.CharField("SMTP Пароль", max_length=200)
    default_from = models.EmailField(
        "From address",
        help_text="Будет использовано как DEFAULT_FROM_EMAIL", default='Gourmet Bistro <no‑reply@yourdomain.com>'
    )

    class Meta:
        verbose_name = "SMTP-{{gender:settings}}"
        verbose_name_plural = "SMTP-{{gender:settings}}"

    def __str__(self):
        return f"{self.username}@{self.host}:{self.port}"


class NotificationSettings(models.Model):
    email_address = models.EmailField("Email для уведомлений")
    telegram_token = models.CharField("Telegram Bot Token", max_length=200)
    telegram_chat_id = models.CharField("Telegram Chat ID", max_length=100)

    class Meta:
        verbose_name = "Настройки уведомлений"
        verbose_name_plural = "Настройки уведомлений"

    def __str__(self):
        return "Настройки уведомлений"


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
        # Получаем настройки
        smtp_cfg = SMTPSettings.objects.first()
        notif_cfg = NotificationSettings.objects.first()

        if not smtp_cfg:
            logger.error("SMTPSettings не настроены в админке")
            return
        if not notif_cfg:
            logger.error("NotificationSettings не настроены в админке")
            return

        # Формируем тему и тело сообщения
        subject = f"Новый заказ #{self.id}"
        body = render_to_string(
            "orders/emails/new_order.txt",
            {"order": self}
        ) if hasattr(self, 'items') else (
            f"{subject}\n"
            f"Клиент: {self.full_name}\n"
            f"Телефон: {self.phone}\n"
            f"Адрес: {self.address}\n\n"
            "Позиции:" +
            "\n".join(f"- {i['dish']}: {i['quantity']}" for i in self.items)
        )

        # Отправляем email через динамическое подключение
        connection = get_connection(
            host=smtp_cfg.host,
            port=smtp_cfg.port,
            username=smtp_cfg.username,
            password=smtp_cfg.password,
            use_tls=smtp_cfg.use_tls
        )
        email = EmailMessage(
            subject=subject,
            body=body,
            from_email=f"Gourmet Bistro <{smtp_cfg.default_from}>",
            to=[notif_cfg.email_address],
            connection=connection
        )
        try:
            email.send(fail_silently=False)
            logger.info("Email-уведомление отправлено на %s", notif_cfg.email_address)
        except Exception as e:
            logger.error("Не удалось отправить email-уведомление: %s", e)

        # Отправляем Telegram
        try:
            resp = requests.post(
                f"https://api.telegram.org/bot{notif_cfg.telegram_token}/sendMessage",
                data={
                    'chat_id': notif_cfg.telegram_chat_id,
                    'text': body
                },
                timeout=5
            )
            resp.raise_for_status()
            logger.info("Telegram-уведомление отправлено в чат %s", notif_cfg.telegram_chat_id)
        except Exception as e:
            logger.error("Не удалось отправить Telegram-уведомление: %s", e)
