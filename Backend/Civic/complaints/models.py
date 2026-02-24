from django.db import models
# from django.contrib.auth.models import User 
from django.utils import timezone
class Complaint(models.Model):
    CHOICE_CATEGORY = [
        ('ROADS', 'Roads & Infrastructure'),
        ('TRAFFIC', 'Traffic & Road Safety'),
        ('WATER', 'Water Supply'),
        ('SEWERAGE', 'Sewerage & Drainage'),
        ('SANITATION', 'Sanitation & Garbage'),
        ('LIGHTING', 'Street Lighting'),
        ('PARKS', 'Parks & Public Spaces'),
        ('ANIMALS', 'Stray Animals'),
        ('ILLEGAL_CONSTRUCTION', 'Illegal Construction'),
        ('ENCROACHMENT', 'Encroachment'),
        ('PROPERTY_DAMAGE', 'Public Property Damage'),
        ('ELECTRICITY', 'Electricity & Power Issues'),
        ('OTHER', 'Other'),
    ]
    CHOICE_PRIORITY=(
        ('Low','Low'),
        ('Medium','Medium'),
        ('High','High')
        )
    CHOICE_STATUS=(
        ('Pending','Pending'),
        ('in-progress','In Progress'),
        ('resolved','Resolved')
        )
    # user=models.ForeignKey(User,on_delete=models.CASCADE,related_name='complaints')
    title=models.CharField(max_length=100)
    Category=models.CharField(max_length=50, choices=CHOICE_CATEGORY, default='Other')
    Description=models.CharField(max_length=300)
    image_video=models.FileField(upload_to='media/', null=True, blank=True)
    location_address=models.CharField(max_length=200)
    location_District=models.CharField(max_length=100)
    location_taluk=models.CharField(max_length=100)
    priority_level=models.CharField(max_length=20, choices=CHOICE_PRIORITY, default='Medium')
    status=models.CharField(max_length=20, choices=CHOICE_STATUS, default='Pending')
    current_time=models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"{self.title} - {self.Category}"