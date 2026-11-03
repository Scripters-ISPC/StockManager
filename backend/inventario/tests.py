from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from auditoria.models import RegistroAuditoria
from .models import Categoria, Material, Proveedor


class MaterialUpdateTests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.admin = user_model.objects.create_user(
            email='admin@example.com',
            password='test-password',
            is_admin=True,
        )
        self.operario = user_model.objects.create_user(
            email='operario@example.com',
            password='test-password',
            is_admin=False,
        )
        self.categoria = Categoria.objects.create(nombre='Herramientas')
        self.proveedor = Proveedor.objects.create(nombre='Proveedor actual')
        self.material = Material.objects.create(
            nombre='Taladro',
            categoria=self.categoria,
            ubicacion='Estante A',
            cantidad_actual=4,
            stock_minimo=1,
            proveedor=self.proveedor,
        )
        self.url = reverse('materiales-detail', args=[self.material.id])

    def test_admin_can_update_all_material_fields(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.patch(self.url, {
            'nombre': 'Taladro industrial',
            'categoria': 'Maquinaria',
            'ubicacion': 'Estante B',
            'cantidadActual': 8,
            'stockMinimo': 2,
            'proveedor': 'Nuevo proveedor',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.material.refresh_from_db()
        self.assertEqual(self.material.nombre, 'Taladro industrial')
        self.assertEqual(self.material.categoria.nombre, 'Maquinaria')
        self.assertEqual(self.material.ubicacion, 'Estante B')
        self.assertEqual(self.material.cantidad_actual, 8)
        self.assertEqual(self.material.stock_minimo, 2)
        self.assertEqual(self.material.proveedor.nombre, 'Nuevo proveedor')
        registro = RegistroAuditoria.objects.get(tipo=RegistroAuditoria.Tipo.EDICION)
        self.assertEqual(registro.material_id, self.material.id)
        self.assertEqual(registro.usuario, self.admin.email)
        self.assertIn('nombre', registro.observacion)
        self.assertIn('Taladro', registro.observacion)
        self.assertIn('Taladro industrial', registro.observacion)

    def test_partial_update_preserves_unsent_relations(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.patch(
            self.url, {'cantidadActual': 5}, format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.material.refresh_from_db()
        self.assertEqual(self.material.categoria, self.categoria)
        self.assertEqual(self.material.proveedor, self.proveedor)
        self.assertFalse(RegistroAuditoria.objects.exists())

    def test_create_material_registers_audit(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(reverse('materiales-list'), {
            'nombre': 'Martillo',
            'categoria': 'Herramientas',
            'ubicacion': 'Estante C',
            'cantidadActual': 3,
            'stockMinimo': 1,
            'proveedor': 'Proveedor actual',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        registro = RegistroAuditoria.objects.get(tipo=RegistroAuditoria.Tipo.CREACION)
        self.assertEqual(registro.material_id, response.data['id'])
        self.assertEqual(registro.stock_nuevo, 3)
        self.assertIn('Martillo', registro.observacion)
        self.assertEqual(registro.usuario, self.admin.email)

    def test_delete_material_registers_audit(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        registro = RegistroAuditoria.objects.get(tipo=RegistroAuditoria.Tipo.ELIMINACION)
        self.assertEqual(registro.material_id, self.material.id)
        self.assertEqual(registro.material_nombre, self.material.nombre)
        self.assertEqual(registro.stock_anterior, 4)
        self.assertEqual(registro.stock_nuevo, 0)
        self.assertIn('Estante A', registro.observacion)

    def test_stock_only_update_keeps_existing_movement_audit_flow(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.patch(
            self.url, {'cantidadActual': 5}, format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(RegistroAuditoria.objects.exists())

    def test_operario_cannot_update_material(self):
        self.client.force_authenticate(user=self.operario)

        response = self.client.patch(
            self.url, {'nombre': 'Cambio no autorizado'}, format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
