from django.urls import path

from .views import PedidoDetailAPIView, PedidoListAPIView

urlpatterns = [
    path('', PedidoListAPIView.as_view(), name='pedidos-list'),
    path('<int:pk>/', PedidoDetailAPIView.as_view(), name='pedidos-detail'),
]
