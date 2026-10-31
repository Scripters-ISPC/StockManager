from django.utils import timezone
from rest_framework import serializers

from .models import RegistroAuditoria


class RegistroAuditoriaSerializer(serializers.ModelSerializer):
    materialId = serializers.IntegerField(source='material_id')
    materialNombre = serializers.CharField(source='material_nombre')
    stockAnterior = serializers.IntegerField(
        source='stock_anterior',
        min_value=0,
    )
    stockNuevo = serializers.IntegerField(
        source='stock_nuevo',
        min_value=0,
    )
    fechaHora = serializers.DateTimeField(
        source='fecha_hora',
        required=False,
        allow_null=True,
    )

    class Meta:
        model = RegistroAuditoria
        fields = [
            'id',
            'materialId',
            'materialNombre',
            'tipo',
            'cantidad',
            'stockAnterior',
            'stockNuevo',
            'usuario',
            'fecha',
            'fechaHora',
            'observacion',
        ]
        extra_kwargs = {
            'usuario': {'read_only': True},
            'fecha': {'required': False},
        }

    def validate_cantidad(self, value):
        if value < 1:
            raise serializers.ValidationError(
                'La cantidad debe ser mayor que cero.'
            )
        return value

    def create(self, validated_data):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            raise serializers.ValidationError(
                'Se requiere un usuario autenticado para registrar auditoría.'
            )
        validated_data['usuario'] = (
            user.get_full_name() or user.email or user.get_username()
        )
        validated_data.setdefault('fecha_hora', timezone.now())
        return super().create(validated_data)
