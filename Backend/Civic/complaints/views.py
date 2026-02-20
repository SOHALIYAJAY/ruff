from django.shortcuts import render
from .models import Complaint
from .serializers import ComplaintSerializer
from django.views.generic import TemplateView,ListView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.mixins import LoginRequiredMixin
from rest_framework.generics import ListAPIView
from .models import Complaint   
from .serializers import ComplaintSerializer


def raisecomplaint(request):
    if request.method=='POST':
        title=request.POST.get('title')
        Category=request.POST.get('category')
        Description=request.POST.get('description')
        image_video=request.POST.get('image_video')
        location_address=request.POST.get('location')
        location_District=request.POST.get('district')
        location_taluk=request.POST.get('taluka')
        priority_level=request.POST.get('priority')

        complaints=complaints(title=title,Category=Category,Description=Description,image_video=image_video,location_address=location_address,location_District=location_District,location_taluk=location_taluk,priority_level=priority_level)
        complaints.save()

       
    return render(request,'Complaint-Civic-Issue-Reporting-System\Frontend\components\raise-complaint-form.tsx')