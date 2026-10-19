from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Material, StockEntry, Pedido, PedidoItem

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'nombre', 'rol', 'estado', 'fecha_registro', 'password']
        read_only_fields = ['id', 'fecha_registro']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = ['id', 'nombre', 'categoria', 'ubicacion', 'cantidad_actual', 'stock_minimo', 'proveedor']
        read_only_fields = ['id']


class StockEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = StockEntry
        fields = ['id', 'material', 'tipo', 'cantidad', 'stock_anterior', 'stock_nuevo', 'usuario', 'fecha', 'observacion']
        read_only_fields = ['id', 'fecha']


class PedidoItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PedidoItem
        fields = ['id', 'pedido', 'material', 'cantidad']
        read_only_fields = ['id']


class PedidoSerializer(serializers.ModelSerializer):
    items = PedidoItemSerializer(many=True, read_only=True)
    solicitante = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        model = Pedido
        fields = [
            'id', 'urgencia', 'estado', 'fecha', 'observaciones',
            'solicitante', 'proveedor_ingreso', 'comentario_ingreso', 'comentario_resolucion',
            'items'
        ]
        read_only_fields = ['id', 'fecha', 'items']
