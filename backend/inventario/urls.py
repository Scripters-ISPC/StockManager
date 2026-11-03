from django.urls import path

from .views import (
    CategoriaDetailAPIView,
    CategoriaListAPIView,
    MaterialDetailAPIView,
    MaterialListAPIView,
    ProveedorDetailAPIView,
    ProveedorListAPIView,
)

urlpatterns = [
    path('materiales/', MaterialListAPIView.as_view(), name='materiales-list'),
    path('materiales/<int:pk>/', MaterialDetailAPIView.as_view(), name='materiales-detail'),
    path('categorias/', CategoriaListAPIView.as_view(), name='categorias-list'),
    path('categorias/<int:pk>/', CategoriaDetailAPIView.as_view(), name='categorias-detail'),
    path('proveedores/', ProveedorListAPIView.as_view(), name='proveedores-list'),
    path('proveedores/<int:pk>/', ProveedorDetailAPIView.as_view(), name='proveedores-detail'),
]
