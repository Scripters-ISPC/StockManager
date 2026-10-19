from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    """Usuario extendido con campos de dominio."""
    nombre = models.CharField(max_length=150, blank=True)
    rol = models.CharField(max_length=30, choices=[('Administrador', 'Administrador'), ('Operario', 'Operario')])
    estado = models.CharField(max_length=20, default='Activo')
    fecha_registro = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombre} ({self.email})"

class Material(models.Model):
    nombre = models.CharField(max_length=200)
    categoria = models.CharField(max_length=100)
    ubicacion = models.CharField(max_length=200)
    cantidad_actual = models.IntegerField(default=0)
    stock_minimo = models.IntegerField(default=0)
    proveedor = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return self.nombre

class StockEntry(models.Model):
    TIPO_MOVIMIENTO = [
        ('INGRESO', 'Ingreso'),
        ('EGRESO', 'Egreso'),
    ]
    material = models.ForeignKey(Material, related_name='movimientos', on_delete=models.CASCADE)
    tipo = models.CharField(max_length=7, choices=TIPO_MOVIMIENTO)
    cantidad = models.IntegerField()
    stock_anterior = models.IntegerField()
    stock_nuevo = models.IntegerField()
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    fecha = models.DateTimeField(auto_now_add=True)
    observacion = models.TextField(blank=True)

    def __str__(self):
        return f"{self.tipo} {self.cantidad} de {self.material.nombre}"

class Pedido(models.Model):
    ESTADO_CHOICES = [
        ('Pendiente', 'Pendiente'),
        ('Entregado', 'Entregado'),
        ('Cancelado', 'Cancelado'),
    ]
    urgencia = models.CharField(max_length=10, choices=[('alta', 'Alta'), ('media', 'Media'), ('baja', 'Baja')])
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='Pendiente')
    fecha = models.DateField(auto_now_add=True)
    observaciones = models.TextField(blank=True)
    solicitante = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='pedidos')

    def __str__(self):
        return f"Pedido #{self.id} - {self.estado}"

class PedidoItem(models.Model):
    pedido = models.ForeignKey(Pedido, related_name='items', on_delete=models.CASCADE)
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    cantidad = models.IntegerField()

    def __str__(self):
        return f"{self.cantidad} x {self.material.nombre}"
