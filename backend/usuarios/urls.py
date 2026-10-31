from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import LoginView, UsuarioViewSet

router = DefaultRouter()
router.register('', UsuarioViewSet, basename='usuarios')

urlpatterns = [
    path('login/', LoginView.as_view(), name='usuario-login'),
    path('login/refresh/', TokenRefreshView.as_view(), name='usuario-login-refresh'),
    path('', include(router.urls)),
]
