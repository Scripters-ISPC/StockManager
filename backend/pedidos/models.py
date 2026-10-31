from django.db import models
from django.utils import timezone


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
    cantidad = models.PositiveIntegerField()
    proveedor = models.CharField(max_length=120)
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
    solicitante_id = models.PositiveBigIntegerField(null=True, blank=True)
    solicitante_nombre = models.CharField(max_length=150, blank=True, default='')
    comentario_resolucion = models.TextField(blank=True, default='')
    comentario_ingreso = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-fecha', '-id']

    def __str__(self):
        return f'{self.producto} #{self.pk}'
