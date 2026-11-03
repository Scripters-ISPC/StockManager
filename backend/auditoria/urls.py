from django.urls import path

from .views import RegistroAuditoriaDetailAPIView, RegistroAuditoriaListAPIView

urlpatterns = [
    path('', RegistroAuditoriaListAPIView.as_view(), name='auditoria-list'),
    path('<int:pk>/', RegistroAuditoriaDetailAPIView.as_view(), name='auditoria-detail'),
]
