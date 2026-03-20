#!/usr/bin/env python
import os
import django
from django.conf import settings

# Add the backend directory to Python path
backend_path = r'C:\Complaint-Civic-Issue-Reporting-System\Complaint-Civic-Issue-Reporting-System-main\Backend'
os.chdir(backend_path)

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Civic.Civic.settings')
django.setup()

from Civic.accounts.models import CustomUser
from Civic.complaints.models import Complaint

# Find user by email
user = CustomUser.objects.filter(email='jaysohaliya5726@gmail.com').first()
if user:
    # Count complaints for this user
    count = Complaint.objects.filter(user=user).count()
    print(f'User: {user.email}')
    print(f'Total complaints: {count}')
    
    # Show complaint details
    complaints = Complaint.objects.filter(user=user).values('id', 'title', 'current_time').order_by('-current_time')
    print('Recent complaints:')
    for comp in complaints:
        print(f'  - ID: {comp["id"]}, Title: {comp["title"]}, Date: {comp["current_time"]}')
        
    # Check total complaints in system
    total_system = Complaint.objects.all().count()
    print(f'Total complaints in system: {total_system}')
else:
    print('User not found')
