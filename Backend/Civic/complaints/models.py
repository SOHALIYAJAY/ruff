from django.db import models
from django.contrib.auth.models import User 
import datetime as dt
class Complaint(models.Model):
    CHOICE_CATEGORY=(
        ('Roads & Infrastructure','Roads & Infrastructure'),
        ('Water Supply','Water Supply'),
        ('Sanitation','Sanitation'),
        ('Street Lighting','Street Lighting'),
        ('Drainage','Drainage'),
        ('Illegal Construction','Illegal Construction'),
        ('Noise Pollution','Noise Pollution'),
        ('Other','Other')
        )
    CHOICE_PRIORITY=(
        ('Low','Low'),
        ('Medium','Medium'),
        ('High','High')
        )
    CHOICE_STATUS=(
        ('open','Open'),
        ('in-progress','In Progress'),
        ('resolved','Resolved')
        )
    
    title=models.CharField(max_length=100)
    Category=models.CharField(choices=CHOICE_CATEGORY,default='Other')
    Description=models.CharField(max_length=300)
    image_video=models.FileField(upload_to='media/',null=True,blank=True)
    location_address=models.CharField(max_length=200)
    location_District=models.CharField(max_length=100)
    location_taluk=models.CharField(max_length=100)
    priority_level=models.CharField(choices=CHOICE_PRIORITY,default='Medium')
    status=models.CharField(choices=CHOICE_STATUS,default='open')
    current_time=models.DateTimeField(default=dt.datetime.now())