#!/usr/bin/env python
import os
import sys
import django

# Setup Django
sys.path.append(r'C:\Complaint-Civic-Issue-Reporting-System\Complaint-Civic-Issue-Reporting-System-main\Backend\Civic')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Civic.settings')
django.setup()

from complaints.models import Complaint
from accounts.models import CustomUser

# Get test user and check their complaints
user = CustomUser.objects.filter(email='test@example.com').first()
if user:
    print(f'Test user found: {user.email} (ID: {user.id})')
    user_complaints = Complaint.objects.filter(user=user)
    print(f'Complaints for this user: {user_complaints.count()}')
    for comp in user_complaints:
        print(f'  - ID: {comp.id}, Title: {comp.title}')
else:
    print('Test user not found')

# Check all complaints
all_complaints = Complaint.objects.all()
print(f'\nAll complaints in database: {all_complaints.count()}')
for comp in all_complaints[:3]:
    print(f'  - ID: {comp.id}, Title: {comp.title}, User: {comp.user}')
