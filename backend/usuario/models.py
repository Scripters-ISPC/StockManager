from django.contrib.auth.models import AbstractUser
from django.db import models

class Usuario(AbstractUser):
    email = models.EmailField(unique=True, blank=False, null=False)
    
    is_admin = models.BooleanField(default=False)

    # Configuramos para que pida el email al iniciar sesión
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username'] 

    def __str__(self):
        return f"{self.first_name} ({'Admin' if self.is_admin else 'Operario'})"
