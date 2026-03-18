from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.generics import ListAPIView, CreateAPIView
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
import datetime as dt 
from complaints.models import Complaint, ComplaintAssignment
from complaints.serializers import ComplaintSerializer, ComplaintAssignmentSerializer
from accounts.models import CustomUser
from departments.models import Department, Officer
from departments.serializers import deptSerializer, OfficerSerializer
from Categories.models import Category
from Categories.serializers import ComplaintCategorySerializer


class getcomplaint(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ComplaintSerializer

    def get_queryset(self):
        return Complaint.objects.filter(user=self.request.user)


class getcomplaintlimit(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ComplaintSerializer
    def get_queryset(self):
        return Complaint.objects.filter(user=self.request.user).order_by('-id')[:3]


class getpubliccomplaints(ListAPIView):
    serializer_class = ComplaintSerializer
    
    def get_queryset(self):
        return Complaint.objects.all().order_by('-id')[:10]



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def complaintsinfo(request):
    total_comp = Complaint.objects.filter(user=request.user).count()
    resolved_comp = Complaint.objects.filter(status='resolved', user=request.user).count()
    pending_comp = Complaint.objects.filter(status='Pending',user=request.user).count()
    inprogress_comp = Complaint.objects.filter(status='in-progress',user=request.user).count()
    
    return Response({
        'total_comp': total_comp,
        'resolved_comp': resolved_comp,
        'pending_comp': pending_comp,
        'inprogress_comp': inprogress_comp
    })


class compinfo(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        total_comp = Complaint.objects.filter(user=request.user).count()
        resolved_comp = Complaint.objects.filter(status='resolved', user=request.user).count()
        pending_comp = Complaint.objects.filter(status='Pending',user=request.user).count()
        total_categories = Category.objects.all().count()
        return Response({
            'total_complaints': total_comp,
            'Resolved_complaints': resolved_comp,
            'Pending_complaints': pending_comp,
            'SLA_complaince': (resolved_comp / total_comp * 100) if total_comp > 0 else 0,
            'total_categories': total_categories
        })


@api_view(['GET'])
def complaintDetails(request, pk):
    try:
        compdetail = Complaint.objects.get(pk=pk)
    except Complaint.DoesNotExist:
        return Response({'error': 'Complaint not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = ComplaintSerializer(compdetail)
    return Response({'compdetail': serializer.data})


class UserDetail(APIView):
    def get(self, request):
        try:
            # Try to get the authenticated user first
            if hasattr(request, 'user') and request.user.is_authenticated:
                user_detail = request.user
            else:
                # Fallback to first user (for testing)
                user_detail = CustomUser.objects.first()
            
            if not user_detail:
                return Response({
                    'error': 'No users found',
                    'message': 'Please create a user account first'
                }, status=404)
            
            return Response({
                'id': user_detail.id,
                'email': user_detail.email,
                'username': getattr(user_detail, 'username', ''),
                'first_name': getattr(user_detail, 'first_name', ''),
                'last_name': getattr(user_detail, 'last_name', ''),
                'created_join': getattr(user_detail, 'created_join', None),
                'is_staff': getattr(user_detail, 'is_staff', False),
                'is_superuser': getattr(user_detail, 'is_superuser', False)
            })
            
        except Exception as e:
            print(f"UserDetail error: {e}")  # Debug print
            return Response({
                'error': str(e),
                'message': 'Failed to fetch user details'
            }, status=500)


class ComplaintStatusStats(APIView):
    def get(self, request):
        try:
            complaints = Complaint.objects.fitler(user=self.request.user)
            
            # Count complaints by status
            status_counts = {
                'open': complaints.filter(status='Pending',user=self.request.user).count(),
                'in_progress': complaints.filter(status='in-progress',user=self.request.user).count(),
                'resolved': complaints.filter(status='resolved',user=self.request.user).count(),
                'pending': complaints.filter(status='Pending',user=self.request.user).count()
            }
            
            return Response(status_counts)
            
        except Exception as e:
            return Response({
                'error': str(e),
                'message': 'Failed to fetch complaint status statistics'
            }, status=500)


class ComplaintMonthlyStats(APIView):
    def get(self, request):
        try:
            from django.db.models import Count
            from django.db.models.functions import ExtractMonth
            import calendar
            
            # Get monthly complaint counts
            monthly_data = {}
            
            # Initialize all months with 0
            for month_num in range(1, 13):
                month_name = calendar.month_name[month_num]
                monthly_data[month_name] = 0
            
            # Count complaints by month (using current_time field instead of created_at)
            complaints_by_month = (
                Complaint.objects
                .annotate(month=ExtractMonth('current_time'))
                .values('month')
                .annotate(count=Count('id'))
                .order_by('month')
            )
            
            # Fill in actual counts
            for item in complaints_by_month:
                month_name = calendar.month_name[item['month']]
                monthly_data[month_name] = item['count']
            
            return Response(monthly_data)
            
        except Exception as e:
            return Response({
                'error': str(e),
                'message': 'Failed to fetch monthly complaint statistics'
            }, status=500)


class DepartmentDashboardStats(APIView):
    def get(self, request):
        try:
            complaints = Complaint.objects.all()
            
            # Calculate statistics
            total = complaints.count()
            pending = complaints.filter(status='Pending').count()
            in_progress = complaints.filter(status='in-progress').count()
            resolved = complaints.filter(status='resolved').count()
            
            # Calculate performance metrics
            resolved_complaints = complaints.filter(status='resolved')
            avg_resolution_time = 4.2  # Mock data - calculate from actual timestamps
            sla_compliance = 87.5  # Mock data - calculate from SLA requirements
            officer_workload = 12  # Mock data - calculate from assignments
            citizen_satisfaction = 4.3  # Mock data - from feedback system
            
            # Get recent complaints
            recent = complaints.order_by('-current_time')[:5]
            recent_data = []
            for comp in recent:
                recent_data.append({
                    'id': comp.id,
                    'title': comp.title,
                    'description': comp.Description,
                    'status': comp.status,
                    'priority': comp.priority_level,
                    'current_time': comp.current_time,
                    'location_address': comp.location_address,
                    'Category': str(comp.Category) if comp.Category else ''
                })
            
            # Get recent activity (mock data for now)
            recent_activity = [
                {
                    'id': '1',
                    'type': 'complaint',
                    'description': f'New complaint: {recent[0].title if recent else "Street Light Issue"}',
                    'time': '2 hours ago',
                    'officer': 'John Doe'
                },
                {
                    'id': '2',
                    'type': 'resolution',
                    'description': f'Complaint #{recent[1].id if len(recent) > 1 else "1234"} resolved by Jane Smith',
                    'time': '3 hours ago'
                },
                {
                    'id': '3',
                    'type': 'assignment',
                    'description': f'Officer assigned to complaint #{recent[2].id if len(recent) > 2 else "1235"}',
                    'time': '5 hours ago'
                }
            ]
            
            return Response({
                'stats': {
                    'total': total,
                    'pending': pending,
                    'inProgress': in_progress,
                    'resolved': resolved
                },
                'performance': {
                    'avgResolutionTime': avg_resolution_time,
                    'slaCompliance': sla_compliance,
                    'officerWorkload': officer_workload,
                    'citizenSatisfaction': citizen_satisfaction
                },
                'recentComplaints': recent_data,
                'recentActivity': recent_activity
            })
            
        except Exception as e:
            return Response({
                'error': str(e),
                'message': 'Failed to fetch department dashboard statistics'
            }, status=500)


class deptinfo(ListAPIView):
    queryset = Department.objects.all()[:3]
    serializer_class = deptSerializer


class complaintinfo(APIView):
    def get(self, request):
        total_comp = Complaint.objects.all().count()
        return Response({"total_comp": total_comp})


class DepartmentList(ListAPIView):
    queryset = Department.objects.all()
    serializer_class = deptSerializer


class complaintofficer(CreateAPIView):
    queryset = ComplaintAssignment.objects.all()
    serializer_class = ComplaintAssignmentSerializer

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        comp_val = data.get('complaint')
        if comp_val is not None and not str(comp_val).isdigit():
            m = re.search(r"(\d+)", str(comp_val))
            if m:
                data['complaint'] = int(m.group(1))

        serializer = self.get_serializer(data=data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class officerprofile(APIView):
    def get(self, request, officer_id):
        try:
            officer = Officer.objects.get(officer_id=officer_id)
            officer_serializer = OfficerSerializer(officer)

            resolved_comp = Complaint.objects.filter(officer_id=officer_id, status='resolved').count()
            total_comp = Complaint.objects.filter(officer_id=officer_id).count()
            pending_comp = Complaint.objects.filter(officer_id=officer_id, status='Pending').count()
            in_progress_comp = Complaint.objects.filter(officer_id=officer_id, status='in-progress').count()

            assigned_complaints = Complaint.objects.filter(officer_id=officer_id)
            complaints_serializer = ComplaintSerializer(assigned_complaints, many=True)

            return Response({
                'officer': officer_serializer.data,
                'resolved_comp': resolved_comp,
                'total_comp': total_comp,
                'pending_comp': pending_comp,
                'in_progress_comp': in_progress_comp,
                'assigned_complaints': complaints_serializer.data
            })
        except Officer.DoesNotExist:
            return Response({'error': 'Officer not found'}, status=status.HTTP_404_NOT_FOUND)


class officerkpi(APIView):
    def get(self, request):
        total_officers = Officer.objects.all().count()
        active_officers = Officer.objects.filter(is_available=True).count()
        total_assigned = Complaint.objects.exclude(officer_id=None).count()
        resolved_comp = Complaint.objects.filter(status='resolved').count()
        total_comp = Complaint.objects.all().count()
        sla_compliance = (resolved_comp / total_comp * 100) if total_comp > 0 else 0

        overloaded = 0
        for officer in Officer.objects.all():
            active_count = Complaint.objects.filter(officer_id=officer.officer_id).exclude(status='resolved').count()
            if active_count > 20:
                overloaded += 1

        return Response({
            'total_officers': total_officers,
            'active_officers': active_officers,
            'total_assigned': total_assigned,
            'sla_compliance': round(sla_compliance, 1),
            'overloaded': overloaded
        })


class adminallcomplaintcart(APIView):
    def get(self, request):
        total_comp = Complaint.objects.all().count()
        Pending_comp = Complaint.objects.filter(status='Pending').count()
        resolved_comp = Complaint.objects.filter(status='resolved').count()
        inprogress_comp = Complaint.objects.filter(status='in-progress').count()
        sla_compliance = (resolved_comp / total_comp * 100) if total_comp > 0 else 0

        return Response({
            'total_comp': total_comp,
            'Pending_comp': Pending_comp,
            'resolved_comp': resolved_comp,
            'inprogress_comp': inprogress_comp,
            'sla_compliance': round(sla_compliance, 1)
        })


class adimncomplaints(ListAPIView):
    queryset = Complaint.objects.all()
    serializer_class = ComplaintSerializer


class ComplaintDelete(APIView):
    def delete(self, request, pk):
        try:
            complaint = Complaint.objects.get(pk=pk)
            complaint.delete()
            return Response({'success': True, 'message': f'Complaint {pk} deleted successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class Updatecomp(APIView):
    def patch(self, request, pk):
        try:
            complaint = Complaint.objects.get(pk=pk)
        except Complaint.DoesNotExist:
            return Response({'error': 'Complaint not found'}, status=status.HTTP_404_NOT_FOUND)

        allowed = ['title', 'Description', 'priority_level', 'status', 'location_address', 'location_District', 'location_taluk']
        data = {k: v for k, v in request.data.items() if k in allowed}

        serializer = ComplaintSerializer(complaint, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class assigncomp(APIView):
    def post(self, request, pk):
        try:
            complaint = Complaint.objects.get(pk=pk)
            officer_id = request.data.get('officer_id')
            officer = Officer.objects.get(officer_id=officer_id)
            complaint.officer_id = officer
            complaint.save()
            return Response({'success': True}, status=status.HTTP_200_OK)
        except Complaint.DoesNotExist:
            return Response({'error': 'Complaint not found'}, status=status.HTTP_404_NOT_FOUND)
        except Officer.DoesNotExist:
            return Response({'error': 'Officer not found'}, status=status.HTTP_404_NOT_FOUND)


class crateofficer(CreateAPIView):
    queryset = Officer.objects.all()
    serializer_class = OfficerSerializer


class CategoriesList(APIView):
    def get(self, request):
        categories = Category.objects.all()
        categoinfo = [
            {'id': c.id, 'name': c.name, 'code': c.code, 'department': c.department, 'total_comp': c.total_comp}
            for c in categories
        ]
        return Response(categoinfo)

    def post(self, request):
        serializer = ComplaintCategorySerializer(data=request.data)
        if serializer.is_valid():
            category = serializer.save()
            return Response(
                {'id': category.id, 'name': category.name, 'code': category.code, 'department': category.department, 'total_comp': category.total_comp},
                status=status.HTTP_201_CREATED
            )
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

 
 
class CategoryDelete(APIView):
    def delete(self, request, pk):
        try:
            category = Category.objects.get(pk=pk)
            category.delete()
            return Response({'success': True, 'message': f'Category {pk} deleted'}, status=status.HTTP_200_OK)
        except Category.DoesNotExist:
            return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class CategoryUpdate(APIView):

    def patch(self, request, pk):
        try:
            category = Category.objects.get(pk=pk)
        except Category.DoesNotExist:
            return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ComplaintCategorySerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class adminstats(APIView):
    def get(self, request):
        return Response({
            'total_users': CustomUser.objects.all().count(),
            'total_categories': Category.objects.all().count(),
            'total_officers': Officer.objects.all().count(),
        })

class CategoryList(ListAPIView):
    queryset=Category.objects.all()
    serializer_class=ComplaintCategorySerializer

class TotalCategories(APIView):
    def get(self, request):
        catelist={}
        cate=Category.objects.all()
        for category in cate:
            catelist[category.code] = Complaint.objects.filter(Category=category).count()
        return Response(catelist)

class TrackComplaint(APIView):
    def get(self, request, pk=None):
        try:
            complaint = Complaint.objects.get(id=pk)
            serializer = ComplaintSerializer(complaint)
            return Response({
                'success': True,
                'data': serializer.data
            })
        except Complaint.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Complaint not found'
            }, status=404)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=500)

class ComplaintMonthWise(APIView):
    def get(self,request):
        comp=Complaint.objects.all()
        month={1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0}
        for i in month:
            month[i]=Complaint.objects.filter(current_time__month=i).count()
        return Response(month)

class ComplaintStatus(APIView):
    def get(self, request):
        status_counts = {
            'Pending': Complaint.objects.filter(status='Pending').count(),
            'In Progress': Complaint.objects.filter(status='in-progress').count(),
            'Resolved': Complaint.objects.filter(status='resolved').count(),
            'Rejected': Complaint.objects.filter(status='rejected').count(),
        }
        return Response(status_counts)

class OfficerDelete(APIView):
    def delete(self, request, pk=None):
        try:
            from departments.models import Officer
            officer = Officer.objects.get(officer_id=pk)
            officer.delete()
            return Response({
                'success': True,
                'message': 'Officer deleted successfully'
            })
        except Officer.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Officer not found'
            }, status=404)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=500)

class OfficerUpdate(APIView):
    def put(self, request, pk=None):
        try:
            from departments.models import Officer
            officer = Officer.objects.get(officer_id=pk)
            
            # Update fields
            officer.name = request.data.get('name', officer.name)
            officer.email = request.data.get('email', officer.email)
            officer.phone = request.data.get('phone', officer.phone)
            officer.is_available = request.data.get('is_available', officer.is_available)
            
            officer.save()
            
            return Response({
                'success': True,
                'message': 'Officer updated successfully',
                'data': {
                    'officer_id': officer.officer_id,
                    'name': officer.name,
                    'email': officer.email,
                    'phone': officer.phone,
                    'is_available': officer.is_available
                }
            })
        except Officer.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Officer not found'
            }, status=404)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=500)

class OfficerAnalytics(APIView):
    def get(self, request):
        try:
            from departments.models import Officer
            from django.db.models import Count, Q
            
            # Total officers
            total_officers = Officer.objects.count()
            
            # Available vs Unavailable
            available_officers = Officer.objects.filter(is_available=True).count()
            unavailable_officers = total_officers - available_officers
            
            # Officers with active complaints
            officers_with_complaints = Complaint.objects.filter(
                officer_id__isnull=False,
                status__in=['Pending', 'in-progress']
            ).values('officer_id').distinct().count()
            
            # Department distribution
            department_stats = {}
            for officer in Officer.objects.all():
                # Get complaints assigned to this officer
                complaint_count = Complaint.objects.filter(
                    officer_id=officer.officer_id,
                    status__in=['Pending', 'in-progress']
                ).count()
                
                # Get department from complaints (assuming each officer belongs to a department)
                complaints = Complaint.objects.filter(officer_id=officer.officer_id)
                if complaints.exists():
                    # Get department from the first complaint's category
                    dept = complaints.first().Category
                    if dept:
                        dept_name = dept.name
                        if dept_name not in department_stats:
                            department_stats[dept_name] = {
                                'officers': 0,
                                'active_complaints': 0
                            }
                        department_stats[dept_name]['officers'] += 1
                        department_stats[dept_name]['active_complaints'] += complaint_count
            
            # Workload distribution
            workload_data = []
            for officer in Officer.objects.all():
                active_complaints = Complaint.objects.filter(
                    officer_id=officer.officer_id,
                    status__in=['Pending', 'in-progress']
                ).count()
                
                workload_data.append({
                    'officer_id': officer.officer_id,
                    'name': officer.name,
                    'active_complaints': active_complaints,
                    'is_available': officer.is_available
                })
            
            return Response({
                'total_officers': total_officers,
                'available_officers': available_officers,
                'unavailable_officers': unavailable_officers,
                'officers_with_complaints': officers_with_complaints,
                'department_stats': department_stats,
                'workload_data': workload_data,
                'availability_percentage': round((available_officers / total_officers) * 100, 1) if total_officers > 0 else 0
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=500)

class Logout(APIView):
    def post(self, request):
        try:
            # Clear session data
            if hasattr(request, 'session'):
                request.session.flush()
            
            # Clear any authentication tokens
            response = Response({
                'success': True,
                'message': 'Logged out successfully'
            })
            
            # Clear cookies if any
            response.delete_cookie('sessionid')
            response.delete_cookie('csrftoken')
            
            return response
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=500)
            

class ComplaintInDetail(APIView):
    def get(self, request, pk=None):
        try:
            if pk:
                # Return specific complaint details
                comp = Complaint.objects.get(pk=pk)
                return Response({
                    'id': comp.id,
                    'comp_name': comp.title,
                    'filed_on': comp.current_time,
                    'description': comp.Description,
                    'upload_image': comp.image_video,
                    'status': comp.status,
                    'priority': comp.priority_level,
                    'location_address': comp.location_address,
                    'location_district': comp.location_District,
                    'location_taluk': comp.location_taluk,
                    'officer_id': comp.officer_id
                })
            else:
                # Return all complaints with basic details
                complaints = Complaint.objects.all()
                complaint_list = []
                for comp in complaints:
                    complaint_list.append({
                        'id': comp.id,
                        'comp_name': comp.title,
                        'filed_on': comp.current_time,
                        'description': comp.Description,
                        'upload_image': comp.image_video,
                        'status': comp.status,
                        'priority': comp.priority_level,
                        'location_address': comp.location_address,
                        'location_district': comp.location_District,
                        'location_taluk': comp.location_taluk,
                        'officer_id': comp.officer_id
                    })
                return Response(complaint_list)
        except Complaint.DoesNotExist:
            return Response({'error': 'Complaint not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)