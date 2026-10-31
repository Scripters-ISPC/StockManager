from django.db import models


class Material(models.Model):
    nombre = models.CharField(max_length=120)
    categoria = models.CharField(max_length=80)
    ubicacion = models.CharField(max_length=100)
    cantidad_actual = models.PositiveIntegerField(default=0)
    stock_minimo = models.PositiveIntegerField(default=0)
    proveedor = models.CharField(max_length=120)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return self.nombre
