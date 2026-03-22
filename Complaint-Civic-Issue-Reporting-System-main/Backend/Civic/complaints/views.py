from django.shortcuts import render
from .models import Complaint, ComplaintAssignment, ComplaintCategory
from .serializers import ComplaintSerializer, ComplaintAssignmentSerializer
from django.views.generic import TemplateView, ListView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.mixins import LoginRequiredMixin
from rest_framework.generics import ListAPIView
from rest_framework import generics, status
from Categories.models import Category


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def createcomplaint(request):
    print("Received data:", request.data)  # Debug log
    data = request.data.copy()
    cat_val = data.get('Category')
    if cat_val is not None and not str(cat_val).isdigit():
        try:
            # Try exact name match first
            cc = Category.objects.filter(name=str(cat_val)).first()
            if not cc:
                # Try case-insensitive match
                cc = Category.objects.filter(name__iexact=str(cat_val)).first()
            if cc:
                data['Category'] = cc.id
                print(f"Found category: {cc.name} with ID: {cc.id}")
            else:
                print(f"Category not found: {cat_val}")
                return Response({
                    'success': False,
                    'errors': {'Category': f'Category "{cat_val}" not found. Please select a valid category.'}
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Error finding category: {e}")
            pass

    serializer = ComplaintSerializer(data=data, context={'request': request})

    if serializer.is_valid():
        complaint = serializer.save()
        return Response({
            'success': True,
            'message': 'Complaint Successfully Submitted',
            'complaint_id': complaint.id,
            'data': ComplaintSerializer(complaint, context={'request': request}).data
        }, status=status.HTTP_201_CREATED)
    
    print("Validation errors:", serializer.errors)  # Debug log
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

