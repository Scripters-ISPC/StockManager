from django.urls import path
from .views import LoginView, RegistroUsuarioView

urlpatterns = [
    path('usuarios/login/', LoginView.as_view(), name='usuario-login'),
    path('usuarios/registrar/', RegistroUsuarioView.as_view(), name='usuario-registro'),
]
