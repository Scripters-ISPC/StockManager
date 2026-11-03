from django.contrib.auth import authenticate
from rest_framework import permissions, serializers, status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from drf_spectacular.utils import OpenApiExample, OpenApiResponse, extend_schema, extend_schema_view

from .models import Usuario
from .serializers import (
    CambiarContrasenaSerializer,
    UsuarioSerializer,
)

class LoginRequestSerializer(serializers.Serializer):
    correo = serializers.EmailField()
    password = serializers.CharField(write_only=True)

class RefreshRequestSerializer(serializers.Serializer):
    refresh = serializers.CharField()

AUTH_ERRORS = {
    400: OpenApiResponse(description='Datos inválidos.'),
    401: OpenApiResponse(description='Credenciales inválidas o token vencido.'),
}


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        tags=['Autenticación'],
        summary='Iniciar sesión',
        description='Autentica al usuario mediante correo y contraseña y devuelve tokens JWT.',
        request=LoginRequestSerializer,
        responses={
            200: OpenApiResponse(
                description='Tokens JWT y datos del usuario autenticado.',
                examples=[OpenApiExample(
                    'Login exitoso',
                    value={'access': 'eyJ...', 'refresh': 'eyJ...', 'usuario': {'id': 1, 'nombre': 'Administrador', 'correo': 'admin@stockmanager.com', 'rol': 'Administrador', 'estado': 'Activo', 'fechaRegistro': '2026-01-01'}},
                )],
            ),
            **AUTH_ERRORS,
        },
        examples=[OpenApiExample(
            'Credenciales',
            value={'correo': 'admin@stockmanager.com', 'password': 'Admin123!'},
            request_only=True,
        )],
    )
    def post(self, request: Request, *args, **kwargs) -> Response:
        correo = request.data.get('correo') or request.data.get('email')
        password = request.data.get('password')
        user = authenticate(email=correo, password=password)
        if user is None:
            raise AuthenticationFailed('Credenciales inválidas.')

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'usuario': UsuarioSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class RefreshTokenAPIView(TokenRefreshView):
    @extend_schema(
        tags=['Autenticación'],
        summary='Renovar access token',
        description='Genera un nuevo access token usando un refresh token vigente.',
        request=RefreshRequestSerializer,
        responses={
            200: OpenApiResponse(
                description='Nuevo access token.',
                examples=[OpenApiExample('Token renovado', value={'access': 'eyJ...'}, response_only=True)],
            ),
            400: OpenApiResponse(description='Refresh token inválido o ausente.'),
            401: OpenApiResponse(description='Refresh token vencido.'),
        },
        examples=[OpenApiExample('Refresh token', value={'refresh': 'eyJ...'}, request_only=True)],
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


@extend_schema_view(
    get=extend_schema(
        tags=['Usuarios'],
        summary='Listar usuarios',
        description='Devuelve todos los usuarios. Solo administradores.',
        responses={200: UsuarioSerializer(many=True), 401: OpenApiResponse(description='Se requiere autenticación.'), 403: OpenApiResponse(description='Se requiere rol administrador.')},
    ),
    post=extend_schema(
        tags=['Usuarios'],
        summary='Crear usuario',
        description='Crea una cuenta de usuario. Solo administradores.',
        request=UsuarioSerializer,
        responses={201: UsuarioSerializer, 400: OpenApiResponse(description='Datos inválidos.'), 401: OpenApiResponse(description='Se requiere autenticación.'), 403: OpenApiResponse(description='Se requiere rol administrador.')},
        examples=[OpenApiExample('Nuevo usuario', value={'nombre': 'Juan Pérez', 'correo': 'juan@example.com', 'password': 'ClaveSegura123!', 'rol': 'Operario'}, request_only=True)],
    ),
)
class UsuarioListAPIView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        serializer = UsuarioSerializer(
            Usuario.objects.all().order_by('id'),
            many=True,
            context={'request': request},
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = UsuarioSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        usuario = serializer.save()
        return Response(
            UsuarioSerializer(usuario, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )


@extend_schema_view(
    get=extend_schema(
        tags=['Usuarios'],
        summary='Obtener usuario',
        description='Devuelve un usuario por ID. Solo administradores.',
        responses={200: UsuarioSerializer, 401: OpenApiResponse(description='Se requiere autenticación.'), 403: OpenApiResponse(description='Se requiere rol administrador.'), 404: OpenApiResponse(description='Usuario no encontrado.')},
    ),
    put=extend_schema(
        tags=['Usuarios'],
        summary='Reemplazar usuario',
        description='Reemplaza los datos de un usuario. Solo administradores.',
        request=UsuarioSerializer,
        responses={200: UsuarioSerializer, 400: OpenApiResponse(description='Datos inválidos.'), 401: OpenApiResponse(description='Se requiere autenticación.'), 403: OpenApiResponse(description='Se requiere rol administrador.'), 404: OpenApiResponse(description='Usuario no encontrado.')},
    ),
    patch=extend_schema(
        tags=['Usuarios'],
        summary='Actualizar usuario',
        description='Actualiza parcialmente un usuario. Solo administradores.',
        request=UsuarioSerializer,
        responses={200: UsuarioSerializer, 400: OpenApiResponse(description='Datos inválidos.'), 401: OpenApiResponse(description='Se requiere autenticación.'), 403: OpenApiResponse(description='Se requiere rol administrador.'), 404: OpenApiResponse(description='Usuario no encontrado.')},
    ),
    delete=extend_schema(
        tags=['Usuarios'],
        summary='Eliminar usuario',
        description='Elimina una cuenta. Solo administradores.',
        responses={204: OpenApiResponse(description='Usuario eliminado.'), 401: OpenApiResponse(description='Se requiere autenticación.'), 403: OpenApiResponse(description='Se requiere rol administrador.'), 404: OpenApiResponse(description='Usuario no encontrado.')},
    ),
)
class UsuarioDetailAPIView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get_object(self, pk):
        return Usuario.objects.get(pk=pk)

    def get(self, request, pk):
        try:
            usuario = self.get_object(pk)
        except Usuario.DoesNotExist:
            return Response({'error': 'No encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(UsuarioSerializer(usuario, context={'request': request}).data, status=status.HTTP_200_OK)

    def _update(self, request, pk, partial):
        try:
            usuario = self.get_object(pk)
        except Usuario.DoesNotExist:
            return Response({'error': 'No encontrado'}, status=status.HTTP_404_NOT_FOUND)
        serializer = UsuarioSerializer(
            usuario,
            data=request.data,
            partial=partial,
            context={'request': request},
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        usuario = serializer.save()
        return Response(
            UsuarioSerializer(usuario, context={'request': request}).data,
            status=status.HTTP_200_OK,
        )

    def put(self, request, pk):
        return self._update(request, pk, partial=False)

    def patch(self, request, pk):
        return self._update(request, pk, partial=True)

    def delete(self, request, pk):
        try:
            self.get_object(pk).delete()
        except Usuario.DoesNotExist:
            return Response({'error': 'No encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)


class CambiarContrasenaView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        tags=['Usuarios'],
        summary='Cambiar contraseña',
        description='Cambia la contraseña del usuario autenticado.',
        request=CambiarContrasenaSerializer,
        responses={200: OpenApiResponse(description='Contraseña actualizada.'), 400: OpenApiResponse(description='Contraseña actual incorrecta o datos inválidos.'), 401: OpenApiResponse(description='Se requiere autenticación.')},
    )
    def post(self, request: Request) -> Response:
        serializer = CambiarContrasenaSerializer(
            data=request.data,
            context={'request': request},
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        request.user.set_password(serializer.validated_data['nueva_contrasena'])
        request.user.save(update_fields=['password'])
        return Response(
            {'detail': 'La contraseña se actualizó correctamente.'},
            status=status.HTTP_200_OK,
        )
