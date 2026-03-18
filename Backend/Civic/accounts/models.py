from django.db import models
from django.contrib.auth.models import AbstractUser, PermissionsMixin
from .managers import CustomUserManager
from datetime import datetime as dt

class CustomUser(AbstractUser, PermissionsMixin):
    CHOICE_FIELDS = (
        ('Civic-User', 'Civic-User'),
        ('Department-User', 'Department-User'),
        ('Admin-User', 'Admin-User')
    )
    email = models.EmailField(unique=True)
    created_join = models.DateField(default=dt.now)
    password = models.CharField(max_length=200)
    User_Role = models.CharField(choices=CHOICE_FIELDS, max_length=200)
    mobile_number = models.CharField(max_length=10, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    district = models.CharField(max_length=100, blank=True, null=True)
    taluka = models.CharField(max_length=100, blank=True, null=True)
    ward_number = models.CharField(max_length=10, blank=True, null=True)
    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email
    