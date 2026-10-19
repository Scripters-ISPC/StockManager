from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Material, StockEntry, Pedido, PedidoItem
from .serializers import MaterialSerializer, StockEntrySerializer, PedidoSerializer, PedidoItemSerializer
from .permissions import IsAdmin, IsOperario, IsAuthenticatedAndReadOnly

# Helper for role‑based permission selection
def get_role_permission(request):
    if request.user.rol == 'Administrador':
        return IsAdmin()
    elif request.user.rol == 'Operario':
        return IsOperario()
    return IsAuthenticatedAndReadOnly()


class MaterialListCreate(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        materials = Material.objects.all()
        serializer = MaterialSerializer(materials, many=True)
        return Response(serializer.data)

    def post(self, request):
        # Only admin can create materials
        perm = get_role_permission(request)
        if not perm.has_permission(request, self):
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = MaterialSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MaterialDetail(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return Material.objects.get(pk=pk)

    def get(self, request, pk):
        material = self.get_object(pk)
        serializer = MaterialSerializer(material)
        return Response(serializer.data)

    def put(self, request, pk):
        perm = get_role_permission(request)
        if not perm.has_permission(request, self):
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        material = self.get_object(pk)
        serializer = MaterialSerializer(material, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        perm = get_role_permission(request)
        if not perm.has_permission(request, self):
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        material = self.get_object(pk)
        material.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class StockEntryListCreate(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        entries = StockEntry.objects.all()
        serializer = StockEntrySerializer(entries, many=True)
        return Response(serializer.data)

    def post(self, request):
        # Both admin and operario can create entries
        serializer = StockEntrySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StockEntryDetail(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return StockEntry.objects.get(pk=pk)

    def get(self, request, pk):
        entry = self.get_object(pk)
        serializer = StockEntrySerializer(entry)
        return Response(serializer.data)

    def put(self, request, pk):
        entry = self.get_object(pk)
        serializer = StockEntrySerializer(entry, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        entry = self.get_object(pk)
        entry.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PedidoListCreate(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        pedidos = Pedido.objects.all()
        serializer = PedidoSerializer(pedidos, many=True)
        return Response(serializer.data)

    def post(self, request):
        # Operario and admin can create pedidos
        serializer = PedidoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PedidoDetail(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return Pedido.objects.get(pk=pk)

    def get(self, request, pk):
        pedido = self.get_object(pk)
        serializer = PedidoSerializer(pedido)
        return Response(serializer.data)

    def put(self, request, pk):
        pedido = self.get_object(pk)
        serializer = PedidoSerializer(pedido, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        pedido = self.get_object(pk)
        pedido.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PedidoItemListCreate(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = PedidoItem.objects.all()
        serializer = PedidoItemSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = PedidoItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PedidoItemDetail(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return PedidoItem.objects.get(pk=pk)

    def get(self, request, pk):
        item = self.get_object(pk)
        serializer = PedidoItemSerializer(item)
        return Response(serializer.data)

    def put(self, request, pk):
        item = self.get_object(pk)
        serializer = PedidoItemSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        item = self.get_object(pk)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
