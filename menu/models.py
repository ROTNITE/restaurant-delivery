from django.db import models

class Category(models.Model):
    name = models.CharField("Категория", max_length=100)
    order = models.PositiveIntegerField("Порядок", default=0)

    def __str__(self):
        return self.name

class Dish(models.Model):
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, verbose_name="Категория", related_name='dishes'
    )
    title = models.CharField("Название", max_length=200)
    description = models.TextField("Описание", blank=True)
    price = models.DecimalField("Цена", max_digits=8, decimal_places=2)
    image = models.ImageField(
        "Фото блюда", upload_to="dishes/", blank=True, null=True
    )
    is_available = models.BooleanField("В продаже", default=True)

    def __str__(self):
        return self.title