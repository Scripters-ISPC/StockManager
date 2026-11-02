from rest_framework import serializers

from .models import Categoria, Material, Proveedor


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre']


class ProveedorSerializer(serializers.ModelSerializer):
    telefono = serializers.CharField(
        required=False,
        allow_blank=True,
        default='',
    )
    correo = serializers.EmailField(
        required=False,
        allow_blank=True,
        default='',
    )
    email = serializers.EmailField(
        source='correo',
        required=False,
        allow_blank=True,
    )

    class Meta:
        model = Proveedor
        fields = [
            'id', 'nombre', 'contacto', 'telefono', 'correo', 'email', 'activo'
        ]

    def validate_telefono(self, value):
        if value:
            import re
            val = value.strip()
            if not re.match(r'^[+0-9\s()./-]{6,30}$', val):
                raise serializers.ValidationError(
                    'Ingrese un formato de teléfono válido (ej: +54 11 4321-0000).'
                )
            return val
        return ''

    def validate_correo(self, value):
        if value:
            return value.strip().lower()
        return ''

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['telefono'] = instance.telefono or ''
        data['correo'] = instance.correo or ''
        data['email'] = instance.correo or ''
        return data

    def create(self, validated_data):
        if not validated_data.get('contacto'):
            tel = validated_data.get('telefono', '').strip()
            cor = validated_data.get('correo', '').strip()
            validated_data['contacto'] = ' | '.join(filter(None, [tel, cor]))
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'contacto' not in validated_data or not validated_data['contacto']:
            tel = validated_data.get('telefono', instance.telefono).strip()
            cor = validated_data.get('correo', instance.correo).strip()
            if not instance.contacto:
                validated_data['contacto'] = ' | '.join(filter(None, [tel, cor]))
        return super().update(instance, validated_data)


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
