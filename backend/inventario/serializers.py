from rest_framework import serializers

from .models import Categoria, Material, Proveedor


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre']


class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedor
        fields = ['id', 'nombre', 'contacto', 'activo']


class MaterialSerializer(serializers.ModelSerializer):
    categoria = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
    )
    proveedor = serializers.CharField(
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
        data['proveedor'] = instance.proveedor.nombre if instance.proveedor else ''
        return data

    def _resolve_relation(self, validated_data, field, model):
        name = validated_data.pop(field, None)
        if name in (None, ''):
            validated_data[field] = None
        else:
            related, _ = model.objects.get_or_create(nombre=name.strip())
            validated_data[field] = related
        return validated_data

    def _resolve_relations(self, validated_data):
        self._resolve_relation(validated_data, 'categoria', Categoria)
        return self._resolve_relation(validated_data, 'proveedor', Proveedor)

    def create(self, validated_data):
        return super().create(self._resolve_relations(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._resolve_relations(validated_data))
