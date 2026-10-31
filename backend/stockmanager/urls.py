from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path(
        'api/v1/docs/',
        SpectacularSwaggerView.as_view(url_name='schema'),
        name='swagger-ui',
    ),
    path('api/v1/usuarios/', include('usuarios.urls')),
    path('api/v1/inventario/', include('inventario.urls')),
    path('api/v1/pedidos/', include('pedidos.urls')),
    path('api/v1/auditoria/', include('auditoria.urls')),
]
