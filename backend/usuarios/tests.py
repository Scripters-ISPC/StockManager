from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Usuario


class CambiarContrasenaTests(APITestCase):
	def setUp(self):
		self.usuario = Usuario.objects.create_user(
			email='operario@stockmanager.com',
			password='ClaveActual99!',
			first_name='Operario',
		)
		self.client.force_authenticate(user=self.usuario)
		self.url = reverse('usuario-cambiar-contrasena')

	def payload(self, **overrides):
		data = {
			'contrasena_actual': 'ClaveActual99!',
			'nueva_contrasena': 'NuevaClave88!',
			'confirmar_contrasena': 'NuevaClave88!',
		}
		data.update(overrides)
		return data

	def test_changes_password_for_authenticated_user(self):
		response = self.client.post(self.url, self.payload(), format='json')

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.usuario.refresh_from_db()
		self.assertTrue(self.usuario.check_password('NuevaClave88!'))

	def test_rejects_incorrect_current_password(self):
		response = self.client.post(
			self.url,
			self.payload(contrasena_actual='Incorrecta99!'),
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.usuario.refresh_from_db()
		self.assertTrue(self.usuario.check_password('ClaveActual99!'))

	def test_rejects_mismatched_new_passwords(self):
		response = self.client.post(
			self.url,
			self.payload(confirmar_contrasena='OtraClave77!'),
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
