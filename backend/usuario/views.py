from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from .serializers import RegistroUsuarioSerializer

class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response(
                {'error': 'Por favor, proporcione correo y contraseña.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Al haber configurado USERNAME_FIELD = 'email', authenticate espera el correo en el parámetro 'username'
        user = authenticate(username=email, password=password)

        if user is not None:
            # Enviamos exactamente lo que el Front necesita para mostrar en el panel
            return Response({
                'message': 'Login exitoso',
                'usuario': {
                    'id': user.id,
                    'nombre': user.first_name,
                    'email': user.email,
                    'rol': 'admin' if user.is_admin else 'operario'
                }
            }, status=status.HTTP_200_OK)
        
        return Response(
            {'error': 'Credenciales inválidas, intente nuevamente.'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )


class RegistroUsuarioView(APIView):
    def post(self, request):
        serializer = RegistroUsuarioSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {'message': 'Usuario creado exitosamente.'}, 
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
