from django.contrib import admin

from .models import RegistroAuditoria


@admin.register(RegistroAuditoria)
class RegistroAuditoriaAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'material_nombre',
        'tipo',
        'cantidad',
        'usuario',
        'fecha',
        'fecha_hora',
    )
    list_filter = ('tipo', 'fecha')
    search_fields = ('material_nombre', 'usuario', 'observacion')
