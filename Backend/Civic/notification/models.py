from django.db import models
from complaints.models import Complaint 
# from django.contrib.auth.models import User
# Create your models here.

class Notification(models.Model):

    # user = models.ForeignKey(
    #     # User,
    #     on_delete=models.CASCADE,
    #     related_name="notifications"
    # )

    # complaint = models.ForeignKey(
    #     "complaints.Complaint",
    #     on_delete=models.CASCADE,
    #     related_name="notifications",
    #     null=True,
    #     blank=True
    # )

    title = models.CharField(max_length=255)
    message = models.TextField()

    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.title}"