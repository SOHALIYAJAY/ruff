from django.shortcuts import render
from django.views.generic import TemplateView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from complaints.models import Complaint   
from complaints.serializers import ComplaintSerializer


class getcomplaint(ListAPIView):
    queryset=Complaint.objects.all()
    serializer_class=ComplaintSerializer