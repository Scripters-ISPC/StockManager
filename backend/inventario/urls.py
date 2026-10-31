from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CategoriaViewSet, MaterialViewSet

router = DefaultRouter()
router.register('materiales', MaterialViewSet, basename='materiales')
router.register('categorias', CategoriaViewSet, basename='categorias')

urlpatterns = [
    path('', include(router.urls)),
]
