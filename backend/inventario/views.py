from rest_framework import permissions, viewsets

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
