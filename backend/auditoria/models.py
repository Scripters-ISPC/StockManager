from django.db import models
from django.utils import timezone


class RegistroAuditoria(models.Model):
    class Tipo(models.TextChoices):
        INGRESO = 'ingreso', 'Ingreso'
        EGRESO = 'egreso', 'Egreso'

    material_id = models.PositiveBigIntegerField()
    material_nombre = models.CharField(max_length=120)
    tipo = models.CharField(max_length=7, choices=Tipo.choices)
    cantidad = models.PositiveIntegerField()
    stock_anterior = models.PositiveIntegerField()
    stock_nuevo = models.PositiveIntegerField()
    usuario = models.CharField(max_length=150)
    fecha = models.DateField(default=timezone.localdate)
    fecha_hora = models.DateTimeField(null=True, blank=True)
    observacion = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-fecha_hora', '-fecha', '-id']

    def __str__(self):
        return f'{self.tipo} - {self.material_nombre} #{self.pk}'
