from django.utils import timezone
from rest_framework import serializers

from inventario.models import Material
from usuarios.models import Usuario
from .models import RegistroAuditoria


class RegistroAuditoriaSerializer(serializers.ModelSerializer):
    materialId = serializers.PrimaryKeyRelatedField(
        source='material',
        queryset=Material.objects.all(),
        required=False,
        allow_null=True,
    )
    materialNombre = serializers.SerializerMethodField()
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
            'usuarioId',
            'usuarioNombre',
            'fecha',
            'fechaHora',
            'observacion',
        ]
        extra_kwargs = {
            'fecha': {'required': False},
        }

    usuarioId = serializers.PrimaryKeyRelatedField(
        source='usuario',
        queryset=Usuario.objects.all(),
        required=False,
        allow_null=True,
        write_only=True,
    )
    usuarioNombre = serializers.SerializerMethodField()

    def get_materialNombre(self, obj):
        return obj.material.nombre if obj.material else obj.material_nombre

    def get_usuarioNombre(self, obj):
        if not obj.usuario:
            return ''
        return obj.usuario.get_full_name().strip() or obj.usuario.email

    def validate_cantidad(self, value):
        if value < 1 and self.initial_data.get('tipo') in (
            RegistroAuditoria.Tipo.INGRESO,
            RegistroAuditoria.Tipo.EGRESO,
        ):
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
        validated_data.setdefault('usuario', user)
        material = validated_data.get('material')
        if material and not validated_data.get('material_nombre'):
            validated_data['material_nombre'] = material.nombre
        validated_data.setdefault('fecha_hora', timezone.now())
        return super().create(validated_data)
