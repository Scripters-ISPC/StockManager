from rest_framework import permissions
from .models import User


class IsAdmin(permissions.BasePermission):
    """Allow access only to users with rol 'Administrador'."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.rol == 'Administrador')


class IsOperario(permissions.BasePermission):
    """Allow access only to users with rol 'Operario'."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.rol == 'Operario')


class IsAuthenticatedAndReadOnly(permissions.BasePermission):
    """Allow authenticated users to perform safe methods (GET, HEAD, OPTIONS)."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.method in permissions.SAFE_METHODS)
