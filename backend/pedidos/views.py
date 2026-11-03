from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import OpenApiExample, OpenApiResponse, extend_schema, extend_schema_view

from .models import Pedido
from .serializers import PedidoSerializer

PEDIDOS_ERRORS = {
    400: OpenApiResponse(description='Datos inválidos o error de validación.'),
    401: OpenApiResponse(description='Se requiere autenticación.'),
    404: OpenApiResponse(description='El pedido solicitado no existe.'),
}

@extend_schema_view(
    get=extend_schema(
        tags=['Pedidos'],
        summary='Listar pedidos',
        description='Devuelve todos los pedidos para usuarios autenticados.',
        responses={200: PedidoSerializer(many=True), **PEDIDOS_ERRORS},
    ),
    post=extend_schema(
        tags=['Pedidos'],
        summary='Crear pedido',
        description='Crea una solicitud de materiales asociada al usuario autenticado.',
        request=PedidoSerializer,
        responses={201: PedidoSerializer, **PEDIDOS_ERRORS},
        examples=[OpenApiExample(
            'Nueva solicitud',
            value={'materialId': 1, 'producto': 'Tornillos M6x20', 'cantidad': 50, 'proveedor': None, 'urgencia': 'media', 'comentario': 'Reposición de stock'},
            request_only=True,
        )],
    ),
)
class PedidoListAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = PedidoSerializer(
            Pedido.objects.select_related('material', 'solicitante').all(),
            many=True,
            context={'request': request},
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = PedidoSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        pedido = serializer.save(
            solicitante=request.user,
            solicitante_nombre=request.user.get_full_name().strip() or request.user.email,
        )
        return Response(
            PedidoSerializer(pedido, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )


@extend_schema_view(
    get=extend_schema(
        tags=['Pedidos'],
        summary='Obtener pedido',
        description='Devuelve un pedido por ID. Requiere autenticación.',
        responses={200: PedidoSerializer, **PEDIDOS_ERRORS},
    ),
    put=extend_schema(
        tags=['Pedidos'],
        summary='Reemplazar pedido',
        description='Reemplaza un pedido existente. Requiere autenticación.',
        request=PedidoSerializer,
        responses={200: PedidoSerializer, **PEDIDOS_ERRORS},
    ),
    patch=extend_schema(
        tags=['Pedidos'],
        summary='Actualizar pedido',
        description='Actualiza parcialmente el estado o los comentarios de un pedido.',
        request=PedidoSerializer,
        responses={200: PedidoSerializer, **PEDIDOS_ERRORS},
    ),
    delete=extend_schema(
        tags=['Pedidos'],
        summary='Eliminar pedido',
        description='Elimina un pedido existente. Requiere autenticación.',
        responses={204: OpenApiResponse(description='Pedido eliminado.'), **PEDIDOS_ERRORS},
    ),
)
class PedidoDetailAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk):
        return Pedido.objects.select_related('material', 'solicitante').get(pk=pk)

    def get(self, request, pk):
        try:
            pedido = self.get_object(pk)
        except Pedido.DoesNotExist:
            return Response({'error': 'No encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(PedidoSerializer(pedido, context={'request': request}).data, status=status.HTTP_200_OK)

    def _update(self, request, pk, partial):
        try:
            pedido = self.get_object(pk)
        except Pedido.DoesNotExist:
            return Response({'error': 'No encontrado'}, status=status.HTTP_404_NOT_FOUND)
        serializer = PedidoSerializer(
            pedido,
            data=request.data,
            partial=partial,
            context={'request': request},
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        pedido = serializer.save()
        return Response(
            PedidoSerializer(pedido, context={'request': request}).data,
            status=status.HTTP_200_OK,
        )

    def put(self, request, pk):
        return self._update(request, pk, partial=False)

    def patch(self, request, pk):
        return self._update(request, pk, partial=True)

    def delete(self, request, pk):
        try:
            self.get_object(pk).delete()
        except Pedido.DoesNotExist:
            return Response({'error': 'No encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)
