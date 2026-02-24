from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


class CustomUserAdmin(admin.ModelAdmin):
    list_display = ["email",'User_Role','created_join']
    

    # # fieldsets = (
    # #     (None, {"fields": ("email", "password")}),
    # #     ("Personal Info", {"fields": ("first_name", "last_name")}),
    # #     ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
    # #     ("Important Dates", {"fields": ("last_login",)}),
    # # )

    # # add_fieldsets = (
    # #     (None, {
    # #         "classes": ("wide",),
    # #         "fields": ("email", "first_name", "last_name", "password1", "password2", "is_staff", "is_superuser"),
    # #     }),
    # # )

    # search_fields = ("email",)

admin.site.register(CustomUser, CustomUserAdmin)