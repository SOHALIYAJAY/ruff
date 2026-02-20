from django.contrib import admin
from reports.models import ContactUs

class AdminContact(admin.ModelAdmin):
    list_display=['full_name','email','phone_number','subject','message']
    
admin.site.register(ContactUs,AdminContact)