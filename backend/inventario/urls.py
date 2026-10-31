from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import MaterialViewSet

router = DefaultRouter()
router.register('materiales', MaterialViewSet, basename='materiales')

urlpatterns = [
    path('', include(router.urls)),
]
