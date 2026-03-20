from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import contact_us
from .serializer import contactusSerializer

# Create your views here.


class ContactUSview(APIView):
    permission_classes = [AllowAny]  # Allow public access for contact form
    
    def get(self, request):
        """Get all contact queries - requires authentication"""
        if not request.user.is_authenticated:
            return Response({
                'success': False,
                'error': 'Authentication required'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            queries = contact_us.objects.all().order_by('-id')
            serializer = contactusSerializer(queries, many=True)
            return Response({
                'success': True,
                'count': queries.count(),
                'results': serializer.data
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """Submit contact form - public access"""
        try:
            serializer = contactusSerializer(data=request.data)
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'success': True,
                    'message': 'Contact form submitted successfully',
                    'data': serializer.data
                }, status=status.HTTP_201_CREATED)
            
            return Response({
                'success': False,
                'errors': serializer.errors,
                'message': 'Form validation failed'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e),
                'message': 'Server error occurred'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


