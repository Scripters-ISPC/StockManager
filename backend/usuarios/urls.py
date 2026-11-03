from django.urls import path

from .views import (
    CambiarContrasenaView,
    LoginView,
    RefreshTokenAPIView,
    UsuarioDetailAPIView,
    UsuarioListAPIView,
)

urlpatterns = [
    path('login/', LoginView.as_view(), name='usuario-login'),
    path('login/refresh/', RefreshTokenAPIView.as_view(), name='usuario-login-refresh'),
    path('cambiar-contrasena/', CambiarContrasenaView.as_view(), name='usuario-cambiar-contrasena'),
    path('', UsuarioListAPIView.as_view(), name='usuarios-list'),
    path('<int:pk>/', UsuarioDetailAPIView.as_view(), name='usuarios-detail'),
]
