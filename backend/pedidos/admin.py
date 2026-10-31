from django.contrib import admin

from .models import Pedido


@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = ('id', 'producto', 'cantidad', 'estado', 'urgencia', 'fecha')
    list_filter = ('estado', 'urgencia', 'fecha')
    search_fields = ('producto', 'proveedor', 'solicitante_nombre')
