from django.contrib import admin
from notification.models import Notification

class AdminNotifications(admin.ModelAdmin):
    list_display=['title','message','is_read','created_at']

admin.site.register(Notification,AdminNotifications)