from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import OpenApiExample, OpenApiResponse, extend_schema, extend_schema_view

from .models import RegistroAuditoria
from .serializers import RegistroAuditoriaSerializer

AUDITORIA_ERRORS = {
    400: OpenApiResponse(description='Datos inválidos o error de validación.'),
    401: OpenApiResponse(description='Se requiere autenticación.'),
    404: OpenApiResponse(description='El registro solicitado no existe.'),
}

@extend_schema_view(
    get=extend_schema(
        tags=['Auditoría'],
        summary='Listar auditoría',
        description='Devuelve el historial de movimientos. Admite filtrar por materialId.',
        responses={200: RegistroAuditoriaSerializer(many=True), **AUDITORIA_ERRORS},
    ),
    post=extend_schema(
        tags=['Auditoría'],
        summary='Crear registro de auditoría',
        description='Registra un movimiento realizado por el usuario autenticado.',
        request=RegistroAuditoriaSerializer,
        responses={201: RegistroAuditoriaSerializer, **AUDITORIA_ERRORS},
        examples=[OpenApiExample(
            'Ingreso de stock',
            value={'materialId': 1, 'tipo': 'ingreso', 'cantidad': 10, 'stockAnterior': 15, 'stockNuevo': 25, 'observacion': 'Reposición recibida'},
            request_only=True,
        )],
    ),
)
class RegistroAuditoriaListAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self, request):
        queryset = RegistroAuditoria.objects.select_related('material', 'usuario').all()
        material_id = request.query_params.get('materialId')
        if material_id:
            queryset = queryset.filter(material_id=material_id)
        return queryset.order_by('-fecha_hora', '-fecha', '-id')

    def get(self, request):
        serializer = RegistroAuditoriaSerializer(
            self.get_queryset(request),
            many=True,
            context={'request': request},
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = RegistroAuditoriaSerializer(
            data=request.data,
            context={'request': request},
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        registro = serializer.save(usuario=request.user)
        return Response(
            RegistroAuditoriaSerializer(registro, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )


@extend_schema_view(
    get=extend_schema(
        tags=['Auditoría'],
        summary='Obtener registro de auditoría',
        description='Devuelve un registro de auditoría por ID.',
        responses={200: RegistroAuditoriaSerializer, **AUDITORIA_ERRORS},
    ),
    put=extend_schema(
        tags=['Auditoría'],
        summary='Reemplazar registro de auditoría',
        description='Reemplaza un registro de auditoría. Requiere autenticación.',
        request=RegistroAuditoriaSerializer,
        responses={200: RegistroAuditoriaSerializer, **AUDITORIA_ERRORS},
    ),
    patch=extend_schema(
        tags=['Auditoría'],
        summary='Actualizar registro de auditoría',
        description='Actualiza parcialmente un registro de auditoría.',
        request=RegistroAuditoriaSerializer,
        responses={200: RegistroAuditoriaSerializer, **AUDITORIA_ERRORS},
    ),
    delete=extend_schema(
        tags=['Auditoría'],
        summary='Eliminar registro de auditoría',
        description='Elimina un registro de auditoría. Requiere autenticación.',
        responses={204: OpenApiResponse(description='Registro eliminado.'), **AUDITORIA_ERRORS},
    ),
)
class RegistroAuditoriaDetailAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk):
        return RegistroAuditoria.objects.select_related('material', 'usuario').get(pk=pk)

    def get(self, request, pk):
        try:
            registro = self.get_object(pk)
        except RegistroAuditoria.DoesNotExist:
            return Response({'error': 'No encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(RegistroAuditoriaSerializer(registro, context={'request': request}).data, status=status.HTTP_200_OK)

    def _update(self, request, pk, partial):
        try:
            registro = self.get_object(pk)
        except RegistroAuditoria.DoesNotExist:
            return Response({'error': 'No encontrado'}, status=status.HTTP_404_NOT_FOUND)
        serializer = RegistroAuditoriaSerializer(
            registro,
            data=request.data,
            partial=partial,
            context={'request': request},
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        registro = serializer.save()
        return Response(
            RegistroAuditoriaSerializer(registro, context={'request': request}).data,
            status=status.HTTP_200_OK,
        )

    def put(self, request, pk):
        return self._update(request, pk, partial=False)

    def patch(self, request, pk):
        return self._update(request, pk, partial=True)

    def delete(self, request, pk):
        try:
            self.get_object(pk).delete()
        except RegistroAuditoria.DoesNotExist:
            return Response({'error': 'No encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)
