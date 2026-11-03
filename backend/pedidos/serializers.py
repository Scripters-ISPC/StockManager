from rest_framework import serializers

from inventario.models import Material
from usuarios.models import Usuario
from .models import Pedido


class PedidoSerializer(serializers.ModelSerializer):
    materialId = serializers.PrimaryKeyRelatedField(
        source='material',
        queryset=Material.objects.all(),
    )
    materialNombre = serializers.CharField(
        source='material.nombre',
        read_only=True,
    )
    comentario = serializers.CharField(
        source='observaciones',
        required=False,
        allow_blank=True,
        allow_null=True,
    )
    proveedor = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
    )
    solicitanteId = serializers.PrimaryKeyRelatedField(
        source='solicitante',
        queryset=Usuario.objects.all(),
        required=False,
        allow_null=True,
    )
    solicitanteNombre = serializers.CharField(
        source='solicitante_nombre',
        required=False,
        allow_blank=True,
    )
    comentarioResolucion = serializers.CharField(
        source='comentario_resolucion',
        required=False,
        allow_blank=True,
    )
    comentarioIngreso = serializers.CharField(
        source='comentario_ingreso',
        required=False,
        allow_blank=True,
    )

    class Meta:
        model = Pedido
        fields = [
            'id',
            'producto',
            'materialId',
            'materialNombre',
            'cantidad',
            'proveedor',
            'urgencia',
            'estado',
            'fecha',
            'comentario',
            'solicitanteId',
            'solicitanteNombre',
            'comentarioResolucion',
            'comentarioIngreso',
        ]

    def validate_cantidad(self, value):
        if value < 1:
            raise serializers.ValidationError(
                'La cantidad debe ser mayor que cero.'
            )
        if value > 9999:
            raise serializers.ValidationError(
                'La cantidad no puede superar las 9999 unidades.'
            )
        return value

    def create(self, validated_data):
        material = validated_data.get('material')
        if material:
            validated_data.setdefault('producto', material.nombre)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        material = validated_data.get('material')
        if material:
            validated_data.setdefault('producto', material.nombre)
        return super().update(instance, validated_data)
