from django.db import transaction
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import (
    OpenApiExample,
    OpenApiResponse,
    extend_schema,
    extend_schema_view,
)

from auditoria.models import RegistroAuditoria
from .models import Categoria, Material, Proveedor
from .serializers import (
    CategoriaSerializer,
    MaterialSerializer,
    ProveedorSerializer,
)

INVENTARIO_ERRORS = {
    400: OpenApiResponse(description='Datos inválidos o error de validación.'),
    401: OpenApiResponse(description='Se requiere autenticación.'),
    403: OpenApiResponse(description='El usuario no tiene permisos de escritura.'),
    404: OpenApiResponse(description='El recurso solicitado no existe.'),
}


class AdminWritePermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        return bool(request.user and request.user.is_staff)


class SerializerListCreateAPIView(APIView):
    serializer_class = None
    queryset = None
    permission_classes = [AdminWritePermission]

    def get(self, request):
        serializer = self.serializer_class(
            self.queryset.all(),
            many=True,
            context={'request': request},
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = self.serializer_class(
            data=request.data,
            context={'request': request},
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        instance = serializer.save()
        return Response(
            self.serializer_class(instance, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )


class SerializerDetailAPIView(APIView):
    serializer_class = None
    queryset = None
    permission_classes = [AdminWritePermission]

    def get_object(self, pk):
        return self.queryset.get(pk=pk)

    def get(self, request, pk):
        try:
            instance = self.get_object(pk)
        except self.queryset.model.DoesNotExist:
            return Response({'error': 'No encontrado'}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.serializer_class(instance, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def _update(self, request, pk, partial):
        try:
            instance = self.get_object(pk)
        except self.queryset.model.DoesNotExist:
            return Response({'error': 'No encontrado'}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.serializer_class(
            instance,
            data=request.data,
            partial=partial,
            context={'request': request},
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(
            self.serializer_class(
                serializer.save(),
                context={'request': request},
            ).data,
            status=status.HTTP_200_OK,
        )

    def put(self, request, pk):
        return self._update(request, pk, partial=False)

    def patch(self, request, pk):
        return self._update(request, pk, partial=True)

    def delete(self, request, pk):
        try:
            self.get_object(pk).delete()
        except self.queryset.model.DoesNotExist:
            return Response({'error': 'No encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)


@extend_schema_view(
    get=extend_schema(
        tags=['Inventario - Categorías'],
        summary='Listar categorías',
        description='Devuelve todas las categorías. Requiere un usuario autenticado.',
        responses={200: CategoriaSerializer(many=True), **INVENTARIO_ERRORS},
    ),
    post=extend_schema(
        tags=['Inventario - Categorías'],
        summary='Crear categoría',
        description='Crea una categoría. Solo administradores pueden realizar esta operación.',
        request=CategoriaSerializer,
        responses={201: CategoriaSerializer, **INVENTARIO_ERRORS},
        examples=[OpenApiExample('Nueva categoría', value={'nombre': 'Ferretería'}, request_only=True)],
    ),
)
class CategoriaListAPIView(SerializerListCreateAPIView):
    serializer_class = CategoriaSerializer
    queryset = Categoria.objects.all()


@extend_schema_view(
    get=extend_schema(
        tags=['Inventario - Categorías'],
        summary='Obtener categoría',
        description='Devuelve una categoría por ID. Requiere autenticación.',
        responses={200: CategoriaSerializer, **INVENTARIO_ERRORS},
    ),
    put=extend_schema(
        tags=['Inventario - Categorías'],
        summary='Reemplazar categoría',
        description='Reemplaza una categoría existente. Solo administradores.',
        request=CategoriaSerializer,
        responses={200: CategoriaSerializer, **INVENTARIO_ERRORS},
        examples=[OpenApiExample('Categoría actualizada', value={'nombre': 'Herramientas'}, request_only=True)],
    ),
    patch=extend_schema(
        tags=['Inventario - Categorías'],
        summary='Actualizar categoría',
        description='Actualiza parcialmente una categoría. Solo administradores.',
        request=CategoriaSerializer,
        responses={200: CategoriaSerializer, **INVENTARIO_ERRORS},
    ),
    delete=extend_schema(
        tags=['Inventario - Categorías'],
        summary='Eliminar categoría',
        description='Elimina una categoría existente. Solo administradores.',
        responses={204: OpenApiResponse(description='Categoría eliminada.'), **INVENTARIO_ERRORS},
    ),
)
class CategoriaDetailAPIView(SerializerDetailAPIView):
    serializer_class = CategoriaSerializer
    queryset = Categoria.objects.all()


@extend_schema_view(
    get=extend_schema(
        tags=['Inventario - Proveedores'],
        summary='Listar proveedores',
        description='Devuelve todos los proveedores. Requiere autenticación.',
        responses={200: ProveedorSerializer(many=True), **INVENTARIO_ERRORS},
    ),
    post=extend_schema(
        tags=['Inventario - Proveedores'],
        summary='Crear proveedor',
        description='Crea un proveedor. Solo administradores pueden realizar esta operación.',
        request=ProveedorSerializer,
        responses={201: ProveedorSerializer, **INVENTARIO_ERRORS},
        examples=[OpenApiExample(
            'Nuevo proveedor',
            value={'nombre': 'Proveedor Demo', 'contacto': 'Logística', 'telefono': '+54 11 4000-0000', 'correo': 'proveedor@example.com', 'activo': True},
            request_only=True,
        )],
    ),
)
class ProveedorListAPIView(SerializerListCreateAPIView):
    serializer_class = ProveedorSerializer
    queryset = Proveedor.objects.all()


@extend_schema_view(
    get=extend_schema(
        tags=['Inventario - Proveedores'],
        summary='Obtener proveedor',
        description='Devuelve un proveedor por ID. Requiere autenticación.',
        responses={200: ProveedorSerializer, **INVENTARIO_ERRORS},
    ),
    put=extend_schema(
        tags=['Inventario - Proveedores'],
        summary='Reemplazar proveedor',
        description='Reemplaza un proveedor existente. Solo administradores.',
        request=ProveedorSerializer,
        responses={200: ProveedorSerializer, **INVENTARIO_ERRORS},
    ),
    patch=extend_schema(
        tags=['Inventario - Proveedores'],
        summary='Actualizar proveedor',
        description='Actualiza parcialmente un proveedor. Solo administradores.',
        request=ProveedorSerializer,
        responses={200: ProveedorSerializer, **INVENTARIO_ERRORS},
    ),
    delete=extend_schema(
        tags=['Inventario - Proveedores'],
        summary='Eliminar proveedor',
        description='Elimina un proveedor existente. Solo administradores.',
        responses={204: OpenApiResponse(description='Proveedor eliminado.'), **INVENTARIO_ERRORS},
    ),
)
class ProveedorDetailAPIView(SerializerDetailAPIView):
    serializer_class = ProveedorSerializer
    queryset = Proveedor.objects.all()


@extend_schema_view(
    get=extend_schema(
        tags=['Inventario - Materiales'],
        summary='Listar materiales',
        description='Devuelve el catálogo de materiales para usuarios autenticados.',
        responses={200: MaterialSerializer(many=True), **INVENTARIO_ERRORS},
    ),
)
class MaterialListAPIView(SerializerListCreateAPIView):
    serializer_class = MaterialSerializer
    queryset = Material.objects.select_related('categoria', 'proveedor')

    @transaction.atomic
    @extend_schema(
        tags=['Inventario - Materiales'],
        summary='Crear material',
        description='Crea un material y registra su ingreso inicial en auditoría. Solo administradores.',
        request=MaterialSerializer,
        responses={201: MaterialSerializer, **INVENTARIO_ERRORS},
        examples=[OpenApiExample(
            'Nuevo material',
            value={'nombre': 'Tornillos M6x20', 'categoria': 'Ferretería', 'ubicacion': 'Estante A-1', 'cantidadActual': 15, 'stockMinimo': 5, 'proveedor': 'Proveedor Demo'},
            request_only=True,
        )],
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        material = serializer.save()
        self._registrar_cambio(
            request,
            material,
            RegistroAuditoria.Tipo.INGRESO,
            0,
            material.cantidad_actual,
            f'Material creado. {self._describir_snapshot(material)}',
        )
        return Response(
            self.serializer_class(material, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )

    @staticmethod
    def _describir_snapshot(material):
        snapshot = {
            'nombre': material.nombre,
            'categoria': material.categoria.nombre if material.categoria else '',
            'ubicacion': material.ubicacion,
            'cantidad actual': material.cantidad_actual,
            'stock minimo': material.stock_minimo,
            'proveedor': material.proveedor.nombre if material.proveedor else '',
        }
        return '; '.join(f'{campo}: {valor}' for campo, valor in snapshot.items())

    @staticmethod
    def _registrar_cambio(request, material, tipo, stock_anterior, stock_nuevo, detalle):
        RegistroAuditoria.objects.create(
            material_id=material.pk,
            material_nombre=material.nombre,
            tipo=tipo,
            cantidad=abs(stock_nuevo - stock_anterior),
            stock_anterior=stock_anterior,
            stock_nuevo=stock_nuevo,
            usuario=request.user,
            fecha=timezone.localdate(),
            fecha_hora=timezone.now(),
            observacion=detalle,
        )


@extend_schema_view(
    get=extend_schema(
        tags=['Inventario - Materiales'],
        summary='Obtener material',
        description='Devuelve un material por ID. Requiere autenticación.',
        responses={200: MaterialSerializer, **INVENTARIO_ERRORS},
    ),
    put=extend_schema(
        tags=['Inventario - Materiales'],
        summary='Reemplazar material',
        description='Reemplaza un material existente y registra la modificación. Solo administradores.',
        request=MaterialSerializer,
        responses={200: MaterialSerializer, **INVENTARIO_ERRORS},
    ),
    patch=extend_schema(
        tags=['Inventario - Materiales'],
        summary='Actualizar material',
        description='Actualiza parcialmente un material o su stock. Solo administradores.',
        request=MaterialSerializer,
        responses={200: MaterialSerializer, **INVENTARIO_ERRORS},
    ),
    delete=extend_schema(
        tags=['Inventario - Materiales'],
        summary='Eliminar material',
        description='Elimina un material y conserva su registro de auditoría. Solo administradores.',
        responses={204: OpenApiResponse(description='Material eliminado.'), **INVENTARIO_ERRORS},
    ),
)
class MaterialDetailAPIView(SerializerDetailAPIView):
    serializer_class = MaterialSerializer
    queryset = Material.objects.select_related('categoria', 'proveedor')

    @transaction.atomic
    def _update(self, request, pk, partial):
        try:
            instance = self.get_object(pk)
        except self.queryset.model.DoesNotExist:
            return Response({'error': 'No encontrado'}, status=status.HTTP_404_NOT_FOUND)
        campos_actualizados = set(request.data)
        anterior = MaterialListAPIView._describir_snapshot(instance)
        stock_anterior = instance.cantidad_actual
        serializer = self.serializer_class(
            instance,
            data=request.data,
            partial=partial,
            context={'request': request},
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        material = serializer.save()
        if campos_actualizados == {'cantidadActual'}:
            return Response(
                self.serializer_class(material, context={'request': request}).data,
                status=status.HTTP_200_OK,
            )
        despues = MaterialListAPIView._describir_snapshot(material)
        MaterialListAPIView._registrar_cambio(
            request,
            material,
            RegistroAuditoria.Tipo.EDICION,
            stock_anterior,
            material.cantidad_actual,
            f'Material editado. Antes: {anterior}. Después: {despues}',
        )
        return Response(
            self.serializer_class(material, context={'request': request}).data,
            status=status.HTTP_200_OK,
        )

    @transaction.atomic
    def delete(self, request, pk):
        try:
            instance = self.get_object(pk)
        except self.queryset.model.DoesNotExist:
            return Response({'error': 'No encontrado'}, status=status.HTTP_404_NOT_FOUND)
        snapshot = MaterialListAPIView._describir_snapshot(instance)
        MaterialListAPIView._registrar_cambio(
            request,
            instance,
            RegistroAuditoria.Tipo.ELIMINACION,
            instance.cantidad_actual,
            0,
            f'Material eliminado. Datos anteriores: {snapshot}',
        )
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
