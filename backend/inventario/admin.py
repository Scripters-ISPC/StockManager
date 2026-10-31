from django.contrib import admin

from .models import Categoria, Material, Proveedor


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    search_fields = ('nombre',)


@admin.register(Proveedor)
class ProveedorAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'contacto', 'activo')
    list_filter = ('activo',)
    search_fields = ('nombre', 'contacto')


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'categoria', 'cantidad_actual', 'stock_minimo')
    list_filter = ('categoria',)
    search_fields = ('nombre', 'proveedor')
