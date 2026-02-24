"""
URL configuration for Civic project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from complaints.views import createcomplaint
from complaints.district_views import DistrictDetailView
from Civic import views
from Civic.views import getcomplaint,UserDetail,complaintsinfo,getcomplaintlimit,compinfo
from accounts.views import RegisterView, LoginView, LogoutView, GoogleLoginView
from contact_us.views import ContactUSview
from Civic.views import getcomplaint
from contact_us.views import ContactUSview

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/raisecomplaint/',createcomplaint,name='raisecomplaint'),
    path('api/getcomplaint/',getcomplaint.as_view(),name='getcomplaint'),
    path('api/getcomplaintlimit/',getcomplaintlimit.as_view(),name='getcomplaintlimit'),
    path('complaintsinfo/',views.complaintsinfo,name='complaintsinfo'),
    path('api/complaintDetails/<int:pk>',views.complaintDetails,name='complaintDetails'),
    # path('api/complaintsinfo/',complaintsinfo,name='complaintsinfo'),
    path('api/getcompinfo/',compinfo.as_view(),name='compinfo'),
    path('api/district/<str:district_name>/', DistrictDetailView.as_view(), name='district-detail'),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/logout/', LogoutView.as_view(), name='logout'),
    path('api/google-login/', GoogleLoginView.as_view(), name='google-login'),

    path('api/contact/',ContactUSview.as_view(),name='contact'),
]