from django.db import models
from django.utils import timezone

from inventario.models import Material
from usuarios.models import Usuario


class RegistroAuditoria(models.Model):
    class Tipo(models.TextChoices):
        INGRESO = 'ingreso', 'Ingreso'
        EGRESO = 'egreso', 'Egreso'
        CREACION = 'creacion', 'Creación'
        EDICION = 'edicion', 'Edición'
        ELIMINACION = 'eliminacion', 'Eliminación'

    material = models.ForeignKey(
        Material,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='registros_auditoria',
    )
    material_nombre = models.CharField(max_length=120)
    tipo = models.CharField(max_length=11, choices=Tipo.choices)
    cantidad = models.PositiveIntegerField()
    stock_anterior = models.PositiveIntegerField()
    stock_nuevo = models.PositiveIntegerField()
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='registros_auditoria',
    )
    fecha = models.DateField(default=timezone.localdate)
    fecha_hora = models.DateTimeField(null=True, blank=True)
    observacion = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-fecha_hora', '-fecha', '-id']

    def __str__(self):
        return f'{self.tipo} - {self.material_nombre} #{self.pk}'
