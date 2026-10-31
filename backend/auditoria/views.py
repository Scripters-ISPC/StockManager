from rest_framework import permissions, viewsets

from .models import RegistroAuditoria
from .serializers import RegistroAuditoriaSerializer


class RegistroAuditoriaViewSet(viewsets.ModelViewSet):
    serializer_class = RegistroAuditoriaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = RegistroAuditoria.objects.all()
        material_id = self.request.query_params.get('materialId')
        if material_id:
            queryset = queryset.filter(material_id=material_id)
        return queryset.order_by('-fecha_hora', '-fecha', '-id')
