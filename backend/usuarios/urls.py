from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import LoginView, UsuarioViewSet

router = DefaultRouter()
router.register('', UsuarioViewSet, basename='usuarios')

urlpatterns = [
    path('login/', LoginView.as_view(), name='usuario-login'),
    path('', include(router.urls)),
]
