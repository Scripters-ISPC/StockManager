from datetime import date

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Usuario


class UsuarioSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(source='first_name', required=True)
    correo = serializers.EmailField(source='email', required=True)
    rol = serializers.ChoiceField(
        choices=['Administrador', 'Operario'], required=False, write_only=True
    )
    estado = serializers.ChoiceField(
        choices=['Activo', 'Inactivo'], required=False, write_only=True
    )
    fechaRegistro = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False, min_length=8)

    class Meta:
        model = Usuario
        fields = [
            'id', 'nombre', 'correo', 'password', 'rol', 'estado',
            'fechaRegistro',
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['rol'] = 'Administrador' if instance.is_admin else 'Operario'
        data['estado'] = 'Activo' if instance.is_active else 'Inactivo'
        return data

    def get_fechaRegistro(self, obj) -> date | None:
        return obj.date_joined.date() if obj.date_joined else None

    def validate_correo(self, value):
        queryset = Usuario.objects.filter(email__iexact=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError(
                'Este correo electrónico ya está registrado.'
            )
        return value.lower()

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        rol = validated_data.pop('rol', 'Operario')
        estado = validated_data.pop('estado', 'Activo')
        validated_data['is_admin'] = rol == 'Administrador'
        validated_data['is_active'] = estado == 'Activo'
        return Usuario.objects.create_user(password=password, **validated_data)

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        rol = validated_data.pop('rol', None)
        estado = validated_data.pop('estado', None)
        for attribute, value in validated_data.items():
            setattr(instance, attribute, value)
        if rol is not None:
            instance.is_admin = rol == 'Administrador'
        if estado is not None:
            instance.is_active = estado == 'Activo'
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class LoginSerializer(TokenObtainPairSerializer):
    username_field = Usuario.USERNAME_FIELD

    def validate(self, attrs):
        data = super().validate(attrs)
        data['usuario'] = UsuarioSerializer(self.user).data
        return data
