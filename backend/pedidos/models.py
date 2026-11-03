from django.conf import settings
from django.db import models
from django.utils import timezone

from inventario.models import Material


class Pedido(models.Model):
    class Urgencia(models.TextChoices):
        BAJA = 'baja', 'Baja'
        MEDIA = 'media', 'Media'
        ALTA = 'alta', 'Alta'

    class Estado(models.TextChoices):
        PENDIENTE = 'Pendiente', 'Pendiente'
        APROBADO = 'Aprobado', 'Aprobado'
        EN_CAMINO = 'En Camino', 'En Camino'
        ENTREGADO = 'Entregado', 'Entregado'
        CANCELADO = 'Cancelado', 'Cancelado'

    producto = models.CharField(max_length=120)
    material = models.ForeignKey(
        Material,
        on_delete=models.CASCADE,
        related_name='pedidos',
    )
    cantidad = models.PositiveIntegerField()
    proveedor = models.CharField(
        max_length=120,
        null=True,
        blank=True,
        default=None,
    )
    urgencia = models.CharField(
        max_length=10,
        choices=Urgencia.choices,
        default=Urgencia.MEDIA,
    )
    estado = models.CharField(
        max_length=20,
        choices=Estado.choices,
        default=Estado.PENDIENTE,
    )
    fecha = models.DateField(default=timezone.localdate)
    observaciones = models.TextField(blank=True, default='')
    solicitante = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='pedidos_solicitados',
    )
    solicitante_nombre = models.CharField(max_length=150, blank=True, default='')
    comentario_resolucion = models.TextField(blank=True, default='')
    comentario_ingreso = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-fecha', '-id']

    def __str__(self):
        return f'{self.producto} #{self.pk}'
