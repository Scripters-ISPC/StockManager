from django.db import transaction
from django.utils import timezone
from rest_framework import permissions, viewsets

from auditoria.models import RegistroAuditoria
from .models import Categoria, Material, Proveedor
from .serializers import (
    CategoriaSerializer,
    MaterialSerializer,
    ProveedorSerializer,
)


class AdminWritePermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_staff


class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [AdminWritePermission]


class ProveedorViewSet(viewsets.ModelViewSet):
    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer
    permission_classes = [AdminWritePermission]


class MaterialViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.select_related('categoria', 'proveedor').all()
    serializer_class = MaterialSerializer
    permission_classes = [AdminWritePermission]

    def _snapshot(self, material):
        return {
            'nombre': material.nombre,
            'categoria': material.categoria.nombre if material.categoria else '',
            'ubicacion': material.ubicacion,
            'cantidad actual': material.cantidad_actual,
            'stock minimo': material.stock_minimo,
            'proveedor': material.proveedor.nombre if material.proveedor else '',
        }

    def _registrar_cambio(self, material, tipo, stock_anterior, stock_nuevo, detalle):
        user = self.request.user
        RegistroAuditoria.objects.create(
            material_id=material.pk,
            material_nombre=material.nombre,
            tipo=tipo,
            cantidad=abs(stock_nuevo - stock_anterior),
            stock_anterior=stock_anterior,
            stock_nuevo=stock_nuevo,
            usuario=user.get_full_name() or user.email or user.get_username(),
            fecha=timezone.localdate(),
            fecha_hora=timezone.now(),
            observacion=detalle,
        )

    def _describir_snapshot(self, snapshot):
        return '; '.join(
            f'{campo}: {valor}' for campo, valor in snapshot.items()
        )

    @transaction.atomic
    def perform_create(self, serializer):
        material = serializer.save()
        self._registrar_cambio(
            material,
            RegistroAuditoria.Tipo.CREACION,
            0,
            material.cantidad_actual,
            f'Material creado. {self._describir_snapshot(self._snapshot(material))}',
        )

    @transaction.atomic
    def perform_update(self, serializer):
        material = serializer.instance
        campos_actualizados = set(serializer.validated_data)
        anterior = self._snapshot(material)
        stock_anterior = material.cantidad_actual
        material = serializer.save()

        # Los ajustes de stock se registran como ingresos/egresos en el flujo de movimientos.
        if campos_actualizados == {'cantidad_actual'}:
            return

        despues = self._snapshot(material)
        self._registrar_cambio(
            material,
            RegistroAuditoria.Tipo.EDICION,
            stock_anterior,
            material.cantidad_actual,
            (
                f'Material editado. Antes: {self._describir_snapshot(anterior)}. '
                f'Después: {self._describir_snapshot(despues)}'
            ),
        )

    @transaction.atomic
    def perform_destroy(self, instance):
        snapshot = self._snapshot(instance)
        stock_anterior = instance.cantidad_actual
        self._registrar_cambio(
            instance,
            RegistroAuditoria.Tipo.ELIMINACION,
            stock_anterior,
            0,
            f'Material eliminado. Datos anteriores: {self._describir_snapshot(snapshot)}',
        )
        instance.delete()
