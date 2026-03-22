from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from complaints.models import Complaint
from complaints.serializers import ComplaintSerializer
from accounts.models import CustomUser
from departments.models import Department, Officer
from departments.serializers import deptSerializer, OfficerSerializer
from rest_framework.generics import CreateAPIView
from django.db import IntegrityError
from rest_framework import status
from rest_framework.exceptions import ValidationError as DRFValidationError
from django.db.models import Count, Avg, Q
from django.utils import timezone
from datetime import timedelta, datetime
import json


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def department_statistics(request):
    """
    Get department-wise complaint and officer statistics for admin dashboard
    """
    try:
        departments_data = []
        
        for dept in Department.objects.all():
            # Count complaints for this department
            complaint_count = Complaint.objects.filter(Category__department=dept.category).count()
            
            # Count officers in this department
            officer_count = dept.officers.count()
            
            departments_data.append({
                'name': dept.name,
                'complaint_count': complaint_count,
                'officer_count': officer_count
            })
        
        return Response({
            'department_statistics': departments_data
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


class OfficerDetail(ListAPIView):
    queryset = Officer.objects.all()
    serializer_class = OfficerSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def department_profile(request):
    """
    Get department profile for the current user's department
    """
    try:
        user = request.user
        
        # Get department based on user's role and department
        department = None
        if hasattr(user, 'departments') and user.departments.exists():
            department = user.departments.first()
        elif hasattr(user, 'headed_department') and user.headed_department.exists():
            department = user.headed_department.first()
        
        if not department:
            return Response({'error': 'No department found for this user'}, status=status.HTTP_404_NOT_FOUND)
        
        # Calculate statistics
        total_officers = department.officers.count()
        
        # Get complaints assigned to this department's officers
        department_officers = department.officers.all()
        active_complaints = Complaint.objects.filter(
            officer_id__in=department_officers,
            status__in=['Pending', 'in-progress']
        ).count()
        resolved_complaints = Complaint.objects.filter(
            officer_id__in=department_officers,
            status='resolved'
        ).count()
        
        # Calculate average resolution time (in days)
        resolved_complaints_with_dates = Complaint.objects.filter(
            officer_id__in=department_officers,
            status='resolved'
        )
        
        avg_resolution_time = 0
        if resolved_complaints_with_dates.exists():
            total_time = sum([
                (timezone.now().date() - comp.current_time.date()).days 
                for comp in resolved_complaints_with_dates
            ])
            avg_resolution_time = total_time / resolved_complaints_with_dates.count()
        
        # Calculate satisfaction rate (using a placeholder since satisfaction_rating field doesn't exist)
        satisfaction_rate = 85.0  # Default satisfaction rate
        
        # Calculate performance score
        performance_score = min(100, (
            (resolved_complaints / max(1, active_complaints + resolved_complaints) * 50) +
            (satisfaction_rate * 0.5)
        ))
        
        profile_data = {
            'id': department.id,
            # `name` stores the category code (e.g. 'ROADS'); provide both code and label
            'code': department.name,
            'name': department.get_category_display(),
            'description': department.description,
            'head': department.head_officer.get_full_name() if department.head_officer else 'Not Assigned',
            'email': department.contact_email,
            'phone': department.contact_phone,
            'address': 'Department Address',  # You may need to add address field to model
            'website': '',
            'establishedYear': 2020,  # You may need to add this field to model
            'totalOfficers': total_officers,
            'activeComplaints': active_complaints,
            'resolvedComplaints': resolved_complaints,
            'avgResolutionTime': round(avg_resolution_time, 1),
            'satisfactionRate': round(satisfaction_rate, 1),
            'performanceScore': round(performance_score, 1),
            'budget': 1000000,  # You may need to add this field to model
            'category': department.get_category_display(),
            'status': 'Active'
        }
        
        return Response(profile_data)
        
    except Exception as e:
        print(f"Error in department_profile: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def department_officers(request):
    """
    Get officers in the current user's department
    """
    try:
        user = request.user
        
        # Get department based on user's role and department
        department = None
        if hasattr(user, 'departments') and user.departments.exists():
            department = user.departments.first()
        elif hasattr(user, 'headed_department') and user.headed_department.exists():
            department = user.headed_department.first()
        
        if not department:
            # No department found for this user — fall back to returning available Officer records
            print(f"No department found for user {user.username} - returning available officers from Officer model")
            officers_qs = Officer.objects.filter(is_available=True)
            # If no available officers, include all officers as a last resort
            if not officers_qs.exists():
                officers_qs = Officer.objects.all()
            officers_data = []
            for officer in officers_qs:
                # Calculate officer statistics (match schema used when department.officers (CustomUser) is returned)
                handled_complaints = Complaint.objects.filter(officer_id=officer.officer_id).count()
                resolved_complaints = Complaint.objects.filter(
                    officer_id=officer.officer_id,
                    status='resolved'
                ).count()

                resolved_complaints_with_dates = Complaint.objects.filter(
                    officer_id=officer.officer_id,
                    status='resolved'
                )

                avg_resolution_time = 0
                if resolved_complaints_with_dates.exists():
                    total_time = sum([
                        (timezone.now().date() - comp.current_time.date()).days 
                        for comp in resolved_complaints_with_dates
                    ])
                    avg_resolution_time = total_time / resolved_complaints_with_dates.count()

                satisfaction_rate = 85.0
                performance_score = min(100, (
                    (resolved_complaints / max(1, handled_complaints) * 50) +
                    (satisfaction_rate * 0.5)
                ))

                officers_data.append({
                    'id': officer.officer_id,
                    'name': officer.name,
                    'email': officer.email,
                    'phone': getattr(officer, 'phone', 'Not Available'),
                    'role': 'Officer',
                    'department': None,
                    'status': 'Active' if officer.is_available else 'Inactive',
                    'joinedDate': None,
                    'totalComplaintsHandled': handled_complaints,
                    'avgResolutionTime': round(avg_resolution_time, 1),
                    'satisfactionRate': round(satisfaction_rate, 1),
                    'performanceScore': round(performance_score, 1)
                })

            return Response(officers_data)

        officers = department.officers.all()
        officers_data = []

        for officer in officers:
            # Calculate officer statistics
            handled_complaints = Complaint.objects.filter(officer_id=officer).count()
            resolved_complaints = Complaint.objects.filter(
                officer_id=officer, 
                status='resolved'
            ).count()
            
            # Calculate average resolution time
            resolved_complaints_with_dates = Complaint.objects.filter(
                officer_id=officer,
                status='resolved'
            )
            
            avg_resolution_time = 0
            if resolved_complaints_with_dates.exists():
                total_time = sum([
                    (timezone.now().date() - comp.current_time.date()).days 
                    for comp in resolved_complaints_with_dates
                ])
                avg_resolution_time = total_time / resolved_complaints_with_dates.count()
            
            # Calculate satisfaction rate (using placeholder)
            satisfaction_rate = 85.0
            
            # Calculate performance score
            performance_score = min(100, (
                (resolved_complaints / max(1, handled_complaints) * 50) +
                (satisfaction_rate * 0.5)
            ))
            
            officers_data.append({
                'id': officer.id,
                'name': officer.get_full_name(),
                'email': officer.email,
                'phone': getattr(officer, 'phone', 'Not Available'),
                'role': 'Officer',
                # return human-readable label for department
                'department': department.get_category_display(),
                'status': 'Active' if officer.is_active else 'Inactive',
                'joinedDate': officer.date_joined.strftime('%Y-%m-%d') if officer.date_joined else 'Unknown',
                'totalComplaintsHandled': handled_complaints,
                'avgResolutionTime': round(avg_resolution_time, 1),
                'satisfactionRate': round(satisfaction_rate, 1),
                'performanceScore': round(performance_score, 1)
            })
        
        return Response(officers_data)
        
    except Exception as e:
        print(f"Error in department_officers: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def department_complaints(request):
    """
    Get complaints for the current user's department
    """
    try:
        user = request.user
        print(f"Department complaints requested by user: {user.username} (ID: {user.id})")
        
        # Get department based on user's role and department
        department = None
        if hasattr(user, 'departments') and user.departments.exists():
            department = user.departments.first()
            print(f"Found department via departments relation: {department.name}")
        elif hasattr(user, 'headed_department') and user.headed_department.exists():
            department = user.headed_department.first()
            print(f"Found department via headed_department relation: {department.name}")
        
        if not department:
            # If user has no department assigned, fall back to returning all complaints
            # This helps department users without an explicit department mapping to still
            # view complaints in the UI (category-wise). Log a warning but do not 404.
            print(f"No department found for user {user.username} - falling back to all complaints")
            complaints = Complaint.objects.all().order_by('-current_time')
            print(f"Found {complaints.count()} total complaints (fallback)")
        else:
            # Get complaints that should be handled by this department
            # Try matching by Category.code or Category.department to be robust
            print(f"Filtering complaints for department code: {department.category}")
            complaints = Complaint.objects.filter(
                Q(Category__code__iexact=department.category) |
                Q(Category__department__iexact=department.category) |
                Q(Category__department__iexact='')
            ).order_by('-current_time')
        
        if department:
            print(f"Found {complaints.count()} complaints for department {department.name}")
        else:
            print(f"Returning {complaints.count()} complaints as fallback for user {user.username}")
        
        complaints_data = []
        
        for complaint in complaints:
            complaints_data.append({
                'id': complaint.id,
                'title': complaint.title or 'Untitled',
                'description': complaint.Description[:200] + '...' if len(complaint.Description) > 200 else complaint.Description,
                'category': complaint.Category.name if complaint.Category else 'Uncategorized',
                'priority': complaint.priority_level,
                'status': complaint.status,
                'submittedDate': complaint.current_time.strftime('%Y-%m-%d') if complaint.current_time else 'Unknown',
                'assignedOfficer': complaint.officer_id.name if complaint.officer_id else 'Unassigned',
                'estimatedResolution': 'Not set',  # This field doesn't exist in the model
                'citizenName': complaint.user.get_full_name() if complaint.user else 'Unknown',
                'citizenEmail': complaint.user.email if complaint.user else 'Unknown',
                'citizenPhone': getattr(complaint.user, 'mobile_number', 'Not Available'),
                'location': complaint.location_address or 'Not specified',
                'satisfactionRating': None  # This field doesn't exist in the model
            })
        
        print(f"Returning {len(complaints_data)} complaints")
        return Response(complaints_data)
        
    except Exception as e:
        print(f"Error in department_complaints: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def department_performance(request):
    """
    Get performance metrics for the current user's department
    """
    try:
        user = request.user
        
        # Get department based on user's role and department
        department = None
        if hasattr(user, 'departments') and user.departments.exists():
            department = user.departments.first()
        elif hasattr(user, 'headed_department') and user.headed_department.exists():
            department = user.headed_department.first()
        
        if not department:
            return Response({'error': 'No department found for this user'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get complaints assigned to this department's officers
        department_officers = department.officers.all()
        
        # Monthly statistics for the last 6 months
        monthly_stats = []
        for i in range(6):
            month_start = timezone.now() - timedelta(days=30*i)
            month_end = timezone.now() - timedelta(days=30*(i-1)) if i > 0 else timezone.now()
            
            month_complaints = Complaint.objects.filter(
                officer_id__in=department_officers,
                current_time__gte=month_start,
                current_time__lt=month_end
            )
            
            month_resolved = month_complaints.filter(status='resolved').count()
            month_pending = month_complaints.filter(status__in=['Pending', 'in-progress']).count()
            
            monthly_stats.append({
                'month': month_start.strftime('%b'),
                'complaints': month_complaints.count(),
                'resolved': month_resolved,
                'pending': month_pending
            })
        
        monthly_stats.reverse()  # Show oldest to newest
        
        # Category distribution
        category_stats = Complaint.objects.filter(
            officer_id__in=department_officers
        ).values(
            'Category__name'
        ).annotate(count=Count('id')).order_by('-count')
        
        category_distribution = []
        colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']
        
        for i, cat in enumerate(category_stats):
            category_distribution.append({
                'category': cat['Category__name'] or 'Uncategorized',
                'count': cat['count'],
                'color': colors[i % len(colors)]
            })
        
        # Priority distribution
        priority_stats = Complaint.objects.filter(
            officer_id__in=department_officers
        ).values(
            'priority_level'
        ).annotate(count=Count('id')).order_by('-count')
        
        priority_colors = {'High': '#EF4444', 'Medium': '#F59E0B', 'Low': '#10B981'}
        priority_distribution = []
        
        for stat in priority_stats:
            priority_distribution.append({
                'priority': stat['priority_level'],
                'count': stat['count'],
                'color': priority_colors.get(stat['priority_level'], '#6B7280')
            })
        
        # Officer performance
        officer_performance = []
        
        for officer in department_officers:
            handled = Complaint.objects.filter(officer_id=officer).count()
            resolved = Complaint.objects.filter(officer_id=officer, status='resolved').count()
            
            # Calculate average time
            resolved_with_dates = Complaint.objects.filter(
                officer_id=officer,
                status='resolved'
            )
            
            avg_time = 0
            if resolved_with_dates.exists():
                total_time = sum([
                    (timezone.now().date() - comp.current_time.date()).days 
                    for comp in resolved_with_dates
                ])
                avg_time = total_time / resolved_with_dates.count()
            
            # Calculate satisfaction (using placeholder)
            satisfaction = 85.0
            
            officer_performance.append({
                'officer': officer.get_full_name(),
                'handled': handled,
                'resolved': resolved,
                'avgTime': round(avg_time, 1),
                'satisfaction': round(satisfaction, 1)
            })
        
        performance_data = {
            'monthlyStats': monthly_stats,
            'categoryDistribution': category_distribution,
            'priorityDistribution': priority_distribution,
            'officerPerformance': officer_performance
        }
        
        return Response(performance_data)
        
    except Exception as e:
        print(f"Error in department_performance: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_department_profile(request):
    """
    Update department profile information
    """
    try:
        user = request.user
        
        # Only department heads can update profile
        department = None
        if hasattr(user, 'headed_department') and user.headed_department.exists():
            department = user.headed_department.first()
        
        if not department:
            return Response({'error': 'Only department heads can update profile'}, status=status.HTTP_403_FORBIDDEN)
        
        data = request.data
        
        # Update allowed fields
        if 'description' in data:
            department.description = data['description']
        if 'contact_email' in data:
            department.contact_email = data['contact_email']
        if 'contact_phone' in data:
            department.contact_phone = data['contact_phone']
        
        department.save()
        
        return Response({'message': 'Profile updated successfully'})
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def department_dashboard(request):
    """
    Department Dashboard API
    Returns comprehensive dashboard data for department users
    """
    try:
        # Get current user and their department
        user = request.user
        
        # Get the actual department the user belongs to
        department_name = None
        try:
            from departments.models import Department
            
            print(f"DEBUG: Checking department for user {user.username}")
            print(f"DEBUG: User_Role = {getattr(user, 'User_Role', 'NOT_FOUND')}")
            
            # Check if user is a department head
            if hasattr(user, 'headed_department') and user.headed_department.exists():
                department = user.headed_department.first()
                department_name = department.name
                print(f"DEBUG: User is department head, department = {department_name}")
            # Check if user is a department officer
            elif hasattr(user, 'departments') and user.departments.exists():
                department = user.departments.first()
                department_name = department.name
                print(f"DEBUG: User is department officer, department = {department_name}")
            # Fallback: try to get department from User_Role for backward compatibility
            elif hasattr(user, 'User_Role') and user.User_Role:
                user_role_str = str(user.User_Role)
                print(f"DEBUG: Using User_Role fallback: {user_role_str}")
                if '-User' in user_role_str:
                    # Try to find department by category code
                    dept_code = user_role_str.replace('-User', '')
                    print(f"DEBUG: Looking for department with code: {dept_code}")
                    department = Department.objects.filter(category=dept_code).first()
                    if department:
                        department_name = department.name
                        print(f"DEBUG: Found department by code: {department_name}")
                    else:
                        department_name = dept_code
                        print(f"DEBUG: Using dept_code as department_name: {department_name}")
                else:
                    department_name = user_role_str
                    print(f"DEBUG: Using user_role_str as department_name: {department_name}")
            
        except Exception as e:
            print(f"Error determining department for user {user.username}: {e}")
            department_name = None
        
        print(f"DEBUG: Final department_name = {department_name}")
        
        if not department_name:
            return Response({'error': 'Unable to determine department for this user'}, status=400)
        
        # Get department statistics
        print(f"DEBUG: Filtering complaints for department: {department_name}")
        total_complaints = Complaint.objects.filter(
            Category__department=department_name
        ).count()
        print(f"DEBUG: Total complaints found: {total_complaints}")
        
        pending_complaints = Complaint.objects.filter(
            Category__department=department_name,
            status='pending'
        ).count()
        print(f"DEBUG: Pending complaints found: {pending_complaints}")
        
        in_progress_complaints = Complaint.objects.filter(
            Category__department=department_name,
            status='in-progress'
        ).count()
        print(f"DEBUG: In-progress complaints found: {in_progress_complaints}")
        
        resolved_complaints = Complaint.objects.filter(
            Category__department=department_name,
            status='resolved'
        ).count()
        print(f"DEBUG: Resolved complaints found: {resolved_complaints}")
        
        # Get officers in department
        # Officers are related to departments through ManyToMany relationship
        try:
            from departments.models import Department
            department = Department.objects.filter(name=department_name).first()
            if department:
                # department.officers returns CustomUser objects
                # We need to get actual Officer records for these users
                officer_users = department.officers.all()
                officer_emails = officer_users.values_list('email', flat=True)
                officers = Officer.objects.filter(email__in=officer_emails)
                print(f"DEBUG: Found {officers.count()} officers for department {department_name}")
            else:
                officers = Officer.objects.none()
                print(f"DEBUG: No department found with name: {department_name}")
        except Exception as e:
            officers = Officer.objects.none()
            print(f"DEBUG: Error getting officers: {e}")
        
        active_officers = officers.filter(is_available=True).count()
        inactive_officers = officers.filter(is_available=False).count()
        print(f"DEBUG: Active officers: {active_officers}, Inactive officers: {inactive_officers}")
        
        # Get performance metrics (calculated from actual data)
        resolved_complaints_with_time = Complaint.objects.filter(
            Category__department=department_name,
            status='resolved',
            resolved_time__isnull=False
        )
        
        # Calculate average resolution time in days
        avg_resolution_time = 0
        if resolved_complaints_with_time.exists():
            total_resolution_time = 0
            count = 0
            for complaint in resolved_complaints_with_time:
                if complaint.current_time and complaint.resolved_time:
                    resolution_days = (complaint.resolved_time - complaint.current_time).days
                    if resolution_days >= 0:  # Only count positive days
                        total_resolution_time += resolution_days
                        count += 1
            if count > 0:
                avg_resolution_time = round(total_resolution_time / count, 1)
        
        # Calculate SLA compliance (assuming 3-day SLA)
        sla_compliance = 0
        if resolved_complaints_with_time.exists():
            sla_compliant_count = 0
            total_resolved = resolved_complaints_with_time.count()
            for complaint in resolved_complaints_with_time:
                if complaint.current_time and complaint.resolved_time:
                    resolution_days = (complaint.resolved_time - complaint.current_time).days
                    if resolution_days <= 3:  # 3-day SLA
                        sla_compliant_count += 1
            if total_resolved > 0:
                sla_compliance = round((sla_compliant_count / total_resolved) * 100, 1)
        
        print(f"DEBUG: Avg resolution time: {avg_resolution_time} days")
        print(f"DEBUG: SLA compliance: {sla_compliance}%")
        
        # Get recent activity
        recent_complaints = Complaint.objects.filter(
            Category__department=department_name
        ).order_by('-current_time')[:5]
        
        recent_activity = []
        for complaint in recent_complaints:
            recent_activity.append({
                'id': str(complaint.id),
                'type': 'complaint',
                'description': complaint.title or 'Untitled',
                'time': complaint.current_time.strftime('%Y-%m-%d %H:%M') if complaint.current_time else 'Unknown',
                'officer': 'Unassigned'  # Since Complaint model doesn't have assigned_officer field
            })
        
        # Get monthly trends
        monthly_trends = []
        for i in range(6):
            month_date = timezone.now() - timedelta(days=30*i)
            month_complaints = Complaint.objects.filter(
                Category__department=department_name,
                current_time__month=month_date.month,
                current_time__year=month_date.year
            ).count()
            monthly_trends.append({
                'month': month_date.strftime('%b %Y'),
                'complaints': month_complaints
            })
        
        # Get category distribution
        categories = Complaint.objects.filter(
            Category__department=department_name
        ).values('Category__name').annotate(count=Count('id'))
        
        category_distribution = []
        for cat in categories:
            category_distribution.append({
                'name': cat['Category__name'] or 'Unknown',
                'value': cat['count'],
                'color': '#3b82f6'  # Default blue color
            })
        
        # Calculate citizen satisfaction (based on resolution rate and timeliness)
        citizen_satisfaction = 0
        if total_complaints > 0:
            # Base satisfaction on resolution rate
            resolution_rate = resolved_complaints / total_complaints
            # Adjust based on SLA compliance
            sla_factor = sla_compliance / 100
            # Calculate satisfaction (scale 1-5)
            citizen_satisfaction = min(5.0, max(1.0, (resolution_rate * 4 * sla_factor) + 1))
            citizen_satisfaction = round(citizen_satisfaction, 1)
        
        print(f"DEBUG: Citizen satisfaction: {citizen_satisfaction}/5")
        
        dashboard_data = {
            'stats': {
                'total': total_complaints,
                'pending': pending_complaints,
                'inProgress': in_progress_complaints,
                'resolved': resolved_complaints
            },
            'performance': {
                'avgResolutionTime': avg_resolution_time,
                'slaCompliance': sla_compliance,
                'officerWorkload': total_complaints / max(active_officers, 1),
                'citizenSatisfaction': citizen_satisfaction
            },
            'officers': {
                'total': officers.count(),
                'active': active_officers,
                'inactive': inactive_officers
            },
        }
        # Calculate SLA metrics based on actual data
        on_time_resolved = 0
        delayed_resolved = 0
        breached_sla = 0
        
        for complaint in resolved_complaints_with_time:
            if complaint.current_time and complaint.resolved_time:
                resolution_days = (complaint.resolved_time - complaint.current_time).days
                if resolution_days <= 3:  # 3-day SLA
                    on_time_resolved += 1
                elif resolution_days <= 7:  # Delayed but within 7 days
                    delayed_resolved += 1
                else:  # Breached SLA (more than 7 days)
                    breached_sla += 1
        
        # Count pending complaints that are at risk of breaching SLA
        pending_risk = 0
        pending_complaints = Complaint.objects.filter(
            Category__department=department_name,
            status='pending'
        )
        for complaint in pending_complaints:
            if complaint.current_time:
                days_pending = (timezone.now() - complaint.current_time).days
                if days_pending > 3:  # At risk of breaching 3-day SLA
                    pending_risk += 1
        
        print(f"DEBUG: SLA metrics - On-time: {on_time_resolved}, Delayed: {delayed_resolved}, Breached: {breached_sla}, At risk: {pending_risk}")
        
        dashboard_data = {
            'stats': {
                'total': total_complaints,
                'pending': pending_complaints,
                'inProgress': in_progress_complaints,
                'resolved': resolved_complaints
            },
            'performance': {
                'avgResolutionTime': avg_resolution_time,
                'slaCompliance': sla_compliance,
                'officerWorkload': total_complaints / max(active_officers, 1),
                'citizenSatisfaction': citizen_satisfaction
            },
            'officers': {
                'total': officers.count(),
                'active': active_officers,
                'inactive': inactive_officers
            },
            'users': {
                'total': CustomUser.objects.filter(User_Role='Civic-User').count(),
                'active': CustomUser.objects.filter(User_Role='Civic-User', is_active=True).count()
            },
            'recentComplaints': recent_complaints,
            'recentActivity': recent_activity,
            'monthlyTrends': monthly_trends[::-1],  # Reverse to show oldest to newest
            'categoryDistribution': category_distribution,
            'slaMetrics': {
                'onTime': on_time_resolved,
                'delayed': delayed_resolved,
                'breached': breached_sla,
                'atRisk': pending_risk
            },
            'workloadDistribution': [
                { 'name': 'High', 'value': max(1, int(total_complaints * 0.3)) },
                { 'name': 'Medium', 'value': max(1, int(total_complaints * 0.5)) },
                { 'name': 'Low', 'value': max(1, int(total_complaints * 0.2)) }
            ]
        }
        
        return Response(dashboard_data)
        
    except Exception as e:
        print(f"Error in department_dashboard: {str(e)}")
        return Response({
            'error': str(e),
            'message': 'Failed to fetch dashboard data'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def departments_overview(request):
    """
    Departments Overview API
    Returns current user's department with head of department info, complaint counts, and statistics
    """
    try:
        # Get current user and their department (same logic as dashboard)
        user = request.user
        department_name = None
        try:
            from departments.models import Department
            
            print(f"DEBUG OVERVIEW: Checking department for user {user.username}")
            print(f"DEBUG OVERVIEW: User_Role = {getattr(user, 'User_Role', 'NOT_FOUND')}")
            
            # Check if user is a department head
            if hasattr(user, 'headed_department') and user.headed_department.exists():
                department = user.headed_department.first()
                department_name = department.name
                print(f"DEBUG OVERVIEW: User is department head, department = {department_name}")
            # Check if user is a department officer
            elif hasattr(user, 'departments') and user.departments.exists():
                department = user.departments.first()
                department_name = department.name
                print(f"DEBUG OVERVIEW: User is department officer, department = {department_name}")
            # Fallback: try to get department from User_Role for backward compatibility
            elif hasattr(user, 'User_Role') and user.User_Role:
                user_role_str = str(user.User_Role)
                print(f"DEBUG OVERVIEW: Using User_Role fallback: {user_role_str}")
                if '-User' in user_role_str:
                    # Try to find department by category code
                    dept_code = user_role_str.replace('-User', '')
                    print(f"DEBUG OVERVIEW: Looking for department with code: {dept_code}")
                    department = Department.objects.filter(category=dept_code).first()
                    if department:
                        department_name = department.name
                        print(f"DEBUG OVERVIEW: Found department by code: {department_name}")
                    else:
                        department_name = dept_code
                        print(f"DEBUG OVERVIEW: Using dept_code as department_name: {department_name}")
                else:
                    department_name = user_role_str
                    print(f"DEBUG OVERVIEW: Using user_role_str as department_name: {department_name}")
            
        except Exception as e:
            print(f"DEBUG OVERVIEW: Error determining department for user {user.username}: {e}")
            department_name = None
        
        print(f"DEBUG OVERVIEW: Final department_name = {department_name}")
        
        if not department_name:
            return Response({
                'error': 'Unable to determine department for this user',
                'message': 'Department information not found'
            }, status=400)
        
        # Only return the current user's department (not all departments)
        departments_data = []
        
        # Get specific department for this user
        department = Department.objects.filter(name=department_name).first()
        if department:
            # Get complaint statistics for this department
            total_complaints = Complaint.objects.filter(
                Category__department=department.category
            ).count()
            
            pending_complaints = Complaint.objects.filter(
                Category__department=department.category,
                status='pending'
            ).count()
            
            in_progress_complaints = Complaint.objects.filter(
                Category__department=department.category,
                status='in-progress'
            ).count()
            
            resolved_complaints = Complaint.objects.filter(
                Category__department=department.category,
                status='resolved'
            ).count()
            
            # Get officers count in this department
            officers_count = department.officers.count()
            active_officers_count = department.officers.filter(is_active=True).count()
            
            # Initialize empty lists for recent activity and monthly trends
            recent_activity = []
            monthly_trends = []
            
            departments_data.append({
                'id': department.id,
                'name': department.name,
                'category': department.category,
                'description': department.description,
                'contact_email': department.contact_email,
                'contact_phone': department.contact_phone,
                'head_officer': {
                    'id': department.head_officer.id if department.head_officer else None,
                    'name': department.head_officer.get_full_name() if department.head_officer else None,
                    'email': department.head_officer.email if department.head_officer else None
                },
                'officers': {
                    'total': officers_count,
                    'active': active_officers_count,
                    'inactive': officers_count - active_officers_count
                },
                'statistics': {
                    'total_complaints': total_complaints,
                    'pending_complaints': pending_complaints,
                    'in_progress_complaints': in_progress_complaints,
                    'resolved_complaints': resolved_complaints,
                    'resolution_rate': round((resolved_complaints / max(total_complaints, 1)) * 100, 1) if total_complaints > 0 else 0,
                    'avg_resolution_time': 2.5,  # Default value
                    'sla_compliance': 85.0  # Default percentage
                },
                'recent_activity': recent_activity,
                'monthly_trends': monthly_trends[::-1],  # Reverse to show oldest to newest
                'created_at': department.created_at.strftime('%Y-%m-%d') if department.created_at else None
            })
            
            return Response({
            'departments': departments_data,
            'overview': {
                'total_departments': len(departments_data),
                'total_complaints': total_complaints,
                'total_resolved': resolved_complaints,
                'overall_resolution_rate': round((resolved_complaints / max(total_complaints, 1)) * 100, 1) if total_complaints > 0 else 0,
                'total_officers': officers_count
            },
            'user_department': department_name
        })
        
    except Exception as e:
        print(f"Error in departments_overview: {str(e)}")
        return Response({
            'error': str(e),
            'message': 'Failed to fetch departments overview'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

   