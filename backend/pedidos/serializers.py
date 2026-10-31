from rest_framework import serializers

from .models import Pedido


class PedidoSerializer(serializers.ModelSerializer):
    solicitanteId = serializers.IntegerField(
        source='solicitante_id',
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
            'cantidad',
            'proveedor',
            'urgencia',
            'estado',
            'fecha',
            'observaciones',
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
        return value
