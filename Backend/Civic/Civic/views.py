from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from complaints.models import Complaint
from complaints.serializers import ComplaintSerializer
from django.contrib.auth.models import User 
from rest_framework.permissions import IsAuthenticated

class getcomplaint(ListAPIView):
    queryset=Complaint.objects.all()
    serializer_class=ComplaintSerializer
    
    
class getcomplaintlimit(ListAPIView):
    queryset=Complaint.objects.order_by('-id')[:3]
    serializer_class=ComplaintSerializer

@api_view(['GET'])
def complaintsinfo(request):    
    total_comp=Complaint.objects.all().count()
    resolved_comp=Complaint.objects.filter(status='resolved').count()
    pending_comp=Complaint.objects.filter(status='Pending').count()
    inprogress_comp=Complaint.objects.filter(status='in-progress').count()

    data={
        'total_comp':total_comp,
        'resolved_comp':resolved_comp,
        'pending_comp':pending_comp,
        'inprogress_comp':inprogress_comp
    }

    return Response(data)

class compinfo(APIView):

    def get(self,request):
        total_comp=Complaint.objects.all().count()
        resolved_comp=Complaint.objects.filter(status='resolved').count()
        pending_comp=Complaint.objects.filter(status='Pending').count()
        # inprogress_comp=Complaint.objects.filter(status='in-progress').count()
        active_dept=10
        data={
            'total_complaints':total_comp,
            'Resolved_complaints':resolved_comp,
            'Pending_complaints':pending_comp,
            'SLA_complaince': (resolved_comp/total_comp*100) if total_comp > 0 else 0,
            # 'inprogress_complaints':inprogress_comp,
            'Active_department':active_dept
        }

        return Response(data)

@api_view(['GET'])
def complaintDetails(pk):
    compdetail=Complaint.objects.get(pk=pk)
    return Response({'compdetail':compdetail})
  
class UserDetail(APIView):
    def get(self, request):
        user_detail = User.objects.get(pk=1)
        return Response({
            'id': user_detail.id,
            'Username': user_detail.username,
            'email': user_detail.email,
            'Date': user_detail.date_joined
        })