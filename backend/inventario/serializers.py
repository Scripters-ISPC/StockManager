from rest_framework import serializers

from .models import Categoria, Material


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre']


class MaterialSerializer(serializers.ModelSerializer):
    categoria = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
    )
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

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['categoria'] = instance.categoria.nombre if instance.categoria else ''
        return data

    def _resolve_categoria(self, validated_data):
        nombre = validated_data.pop('categoria', None)
        if nombre in (None, ''):
            validated_data['categoria'] = None
        else:
            categoria, _ = Categoria.objects.get_or_create(nombre=nombre.strip())
            validated_data['categoria'] = categoria
        return validated_data

    def create(self, validated_data):
        return super().create(self._resolve_categoria(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._resolve_categoria(validated_data))
