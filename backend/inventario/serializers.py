from rest_framework import serializers

from .models import Material


class MaterialSerializer(serializers.ModelSerializer):
    cantidadActual = serializers.IntegerField(
        source='cantidad_actual', min_value=0
    )
    stockMinimo = serializers.IntegerField(
        source='stock_minimo', min_value=0
    )

    class Meta:
        model = Material
        fields = [
            'id', 'nombre', 'categoria', 'ubicacion', 'cantidadActual',
            'stockMinimo', 'proveedor',
        ]
