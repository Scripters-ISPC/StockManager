from rest_framework import serializers
from .models import Usuario

class RegistroUsuarioSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    nombre = serializers.CharField(source='first_name', required=True)

    class Meta:
        model = Usuario
        fields = ['nombre', 'email', 'password', 'is_admin']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate_email(self, value):
        if Usuario.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este correo electrónico ya está registrado.")
        return value

    def create(self, validated_data):
        # Extraemos el nombre para pasarlo a first_name internamente
        first_name = validated_data.pop('first_name', '')
        
        # El username interno de Django lo igualamos al email para evitar conflictos
        email = validated_data['email']
        
        user = Usuario.objects.create_user(
            username=email, 
            email=email,
            password=validated_data['password'],
            first_name=first_name,
            is_admin=validated_data.get('is_admin', False)
        )
        return user
