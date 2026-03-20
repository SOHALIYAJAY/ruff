from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count, Avg
from django.utils import timezone
from datetime import timedelta, datetime
from complaints.models import Complaint
from complaints.serializers import ComplaintSerializer
from departments.models import Officer, Department
from accounts.models import CustomUser
import json

def _get_officer_for_user(user):
    """Resolve an Officer instance for a given CustomUser.
    Tries in order: officer_id == f"OFF{user.id}", email == user.email, officer_id == str(user).
    Returns Officer or None.
    """
    if not user:
        return None
    try:
        return Officer.objects.get(officer_id=f"OFF{user.id}")
    except Officer.DoesNotExist:
        try:
            return Officer.objects.get(email=getattr(user, 'email', None))
        except Officer.DoesNotExist:
            try:
                return Officer.objects.get(officer_id=str(user))
            except Officer.DoesNotExist:
                return None


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def officer_dashboard_stats(request):
    """
    Get dashboard statistics for the current officer
    """
    try:
        user = request.user
        print(f"Officer dashboard stats requested by user: {user.username} (ID: {user.id})")
        
        # Get officer profile for this user
        officer = _get_officer_for_user(user)
        if not officer:
            print(f"No officer profile found for user {user.username}")
            return Response({'error': 'Officer profile not found'}, status=404)
        
        # Get complaints assigned to this officer
        assigned_complaints = Complaint.objects.filter(officer_id=officer)
        
        # Calculate statistics
        total_assigned = assigned_complaints.count()
        pending_complaints = assigned_complaints.filter(status='Pending').count()
        in_progress_complaints = assigned_complaints.filter(status='in-progress').count()
        resolved_complaints = assigned_complaints.filter(status='resolved').count()
        
        # Calculate overdue complaints (older than 7 days and not resolved)
        seven_days_ago = timezone.now() - timedelta(days=7)
        overdue_complaints = assigned_complaints.filter(
            current_time__lt=seven_days_ago,
            status__in=['Pending', 'in-progress']
        ).count()
        
        # Calculate average resolution time
        # Since Complaint model doesn't have updated_at field, use a reasonable default
        avg_resolution_time = 2.5  # Default average resolution time in days
        
        # Recent activity (last 7 days)
        seven_days_ago = timezone.now() - timedelta(days=7)
        recent_complaints = assigned_complaints.filter(
            current_time__gte=seven_days_ago
        ).count()
        
        stats_data = {
            'totalAssigned': total_assigned,
            'pending': pending_complaints,
            'inProgress': in_progress_complaints,
            'resolved': resolved_complaints,
            'overdue': overdue_complaints,
            'avgResolutionTime': round(avg_resolution_time, 1),
            'recentActivity': recent_complaints,
            'officerName': officer.name,
            'officerId': officer.officer_id,
            'department': officer.department.name if officer.department else 'Not Assigned'
        }
        
        print(f"Officer stats calculated: {stats_data}")
        return Response(stats_data)
        
    except Exception as e:
        print(f"Error in officer_dashboard_stats: {str(e)}")
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def officer_complaints(request):
    """
    Get complaints assigned to the current officer with filtering
    """
    try:
        user = request.user
        print(f"Officer complaints requested by user: {user.username}")
        
        # Get officer profile
        officer = _get_officer_for_user(user)
        if not officer:
            return Response({'error': 'Officer profile not found'}, status=404)
        
        # Get base queryset
        complaints = Complaint.objects.filter(officer_id=officer).order_by('-current_time')
        
        # Apply filters
        status_filter = request.GET.get('status', 'all')
        category_filter = request.GET.get('category', 'all')
        search_query = request.GET.get('search', '')
        
        if status_filter != 'all':
            complaints = complaints.filter(status=status_filter)
        
        if category_filter != 'all':
            complaints = complaints.filter(Category__name=category_filter)
        
        if search_query:
            complaints = complaints.filter(
                Q(title__icontains=search_query) |
                Q(id__icontains=search_query) |
                Q(Description__icontains=search_query)
            )
        
        # Get unique categories for filter dropdown
        categories = Complaint.objects.filter(officer_id=officer).values_list(
            'Category__name', flat=True
        ).distinct()
        
        complaints_data = []
        for complaint in complaints:
            # Check if complaint is overdue (older than 7 days and not resolved)
            seven_days_ago = timezone.now() - timedelta(days=7)
            is_overdue = (
                complaint.current_time < seven_days_ago and 
                complaint.status in ['Pending', 'in-progress']
            )
            
            complaints_data.append({
                'id': complaint.id,
                'title': complaint.title or 'Untitled',
                'description': complaint.Description[:200] + '...' if len(complaint.Description) > 200 else complaint.Description,
                'category': complaint.Category.name if complaint.Category else 'Uncategorized',
                'status': complaint.status,
                'priority': complaint.priority_level,
                'date': complaint.current_time.strftime('%Y-%m-%d') if complaint.current_time else 'Unknown',
                'submittedDate': complaint.current_time.strftime('%Y-%m-%d') if complaint.current_time else 'Unknown',
                'location': complaint.location_address or 'Not specified',
                'citizenName': complaint.user.get_full_name() if complaint.user else 'Unknown',
                'citizenEmail': complaint.user.email if complaint.user else 'Unknown',
                'citizenPhone': getattr(complaint.user, 'mobile_number', 'Not Available'),
                'isOverdue': is_overdue,
                'image': complaint.image_video.url if complaint.image_video else None,
                'remarks': getattr(complaint, 'remarks', ''),
                'updatedAt': complaint.current_time.strftime('%Y-%m-%d %H:%M') if complaint.current_time else None
            })
        
        response_data = {
            'complaints': complaints_data,
            'categories': list(categories),
            'total': len(complaints_data),
            'filters': {
                'status': status_filter,
                'category': category_filter,
                'search': search_query
            }
        }
        
        print(f"Returning {len(complaints_data)} complaints for officer {officer.name}")
        return Response(response_data)
        
    except Exception as e:
        print(f"Error in officer_complaints: {str(e)}")
        return Response({'error': str(e)}, status=500)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_complaint_status(request, complaint_id):
    """
    Update complaint status and remarks
    """
    try:
        user = request.user
        print(f"Update complaint status requested by user: {user.username} for complaint {complaint_id}")
        
        # Get officer profile
        officer = _get_officer_for_user(user)
        if not officer:
            return Response({'error': 'Officer profile not found'}, status=404)
        
        # Get complaint
        try:
            complaint = Complaint.objects.get(id=complaint_id, officer_id=officer)
        except Complaint.DoesNotExist:
            return Response({'error': 'Complaint not found or not assigned to you'}, status=404)
        
        # Get update data
        new_status = request.data.get('status')
        remarks = request.data.get('remarks', '')
        resolution_image = request.FILES.get('resolution_image')
        
        # Validate status
        valid_statuses = ['Pending', 'in-progress', 'resolved']
        if new_status not in valid_statuses:
            return Response({'error': f'Invalid status. Must be one of: {valid_statuses}'}, status=400)
        
        # Update complaint
        complaint.status = new_status
        complaint.updated_at = timezone.now()
        
        if remarks:
            # Add remarks to complaint (assuming there's a remarks field)
            # If not, we could create a separate Remarks model
            complaint.remarks = remarks
        
        if resolution_image:
            complaint.resolution_image = resolution_image
        
        complaint.save()
        
        # Log the update
        print(f"Complaint {complaint_id} status updated to {new_status} by officer {officer.name}")
        
        return Response({
            'message': 'Complaint updated successfully',
            'complaint': {
                'id': complaint.id,
                'status': complaint.status,
                'remarks': getattr(complaint, 'remarks', ''),
                'updatedAt': complaint.updated_at.strftime('%Y-%m-%d %H:%M')
            }
        })
        
    except Exception as e:
        print(f"Error in update_complaint_status: {str(e)}")
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def officer_performance(request):
    """
    Get performance metrics for the current officer
    """
    try:
        user = request.user
        print(f"Officer performance requested by user: {user.username}")
        
        # Get officer profile
        officer = _get_officer_for_user(user)
        if not officer:
            return Response({'error': 'Officer profile not found'}, status=404)
        
        # Get complaints assigned to this officer
        complaints = Complaint.objects.filter(officer_id=officer)
        
        # Monthly statistics for the last 6 months
        monthly_stats = []
        for i in range(6):
            month_start = timezone.now() - timedelta(days=30*i)
            month_end = timezone.now() - timedelta(days=30*(i-1)) if i > 0 else timezone.now()
            
            month_complaints = complaints.filter(
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
        category_stats = complaints.values(
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
        priority_stats = complaints.values(
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
        
        # Performance metrics
        total_complaints = complaints.count()
        resolved_complaints = complaints.filter(status='resolved').count()
        resolution_rate = (resolved_complaints / max(1, total_complaints)) * 100
        
        # Average resolution time
        resolved_with_dates = complaints.filter(status='resolved')
        avg_resolution_time = 0
        if resolved_with_dates.exists():
            total_time = sum([
                (comp.updated_at.date() - comp.current_time.date()).days 
                if comp.updated_at else (timezone.now().date() - comp.current_time.date()).days
                for comp in resolved_with_dates
            ])
            avg_resolution_time = total_time / resolved_with_dates.count()
        
        performance_data = {
            'monthlyStats': monthly_stats,
            'categoryDistribution': category_distribution,
            'priorityDistribution': priority_distribution,
            'metrics': {
                'totalComplaints': total_complaints,
                'resolvedComplaints': resolved_complaints,
                'resolutionRate': round(resolution_rate, 1),
                'avgResolutionTime': round(avg_resolution_time, 1),
                'pendingComplaints': complaints.filter(status__in=['Pending', 'in-progress']).count()
            }
        }
        
        return Response(performance_data)
        
    except Exception as e:
        print(f"Error in officer_performance: {str(e)}")
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def officer_dashboard_stats(request):
    """
    Get dashboard statistics for officer
    """
    user = request.user
    
    try:
        from complaints.models import Complaint
        from datetime import datetime, timedelta
        
        # Get all complaints
        all_complaints = Complaint.objects.all()
        officer = _get_officer_for_user(user)
        if not officer:
            return Response({'error': 'Officer profile not found'}, status=404)
        officer_complaints = Complaint.objects.filter(officer_id=officer)
        
        # Calculate stats
        total_complaints = officer_complaints.count()
        resolved_complaints = officer_complaints.filter(status='resolved').count()
        pending_complaints = officer_complaints.filter(status='Pending').count()
        in_progress_complaints = officer_complaints.filter(status='in-progress').count()
        
        # Today's complaints
        today = datetime.now().date()
        today_complaints = officer_complaints.filter(current_time__date=today).count()
        
        # This week's complaints
        week_start = today - timedelta(days=today.weekday())
        weekly_complaints = officer_complaints.filter(current_time__date__gte=week_start).count()
        
        # Average resolution time
        resolved_complaints_with_dates = officer_complaints.filter(
            status='resolved',
            updated_at__isnull=False
        )
        
        avg_resolution_time = 0
        if resolved_complaints_with_dates.exists():
            total_days = 0
            for complaint in resolved_complaints_with_dates:
                if complaint.current_time and complaint.updated_at:
                    days = (complaint.updated_at.date() - complaint.current_time.date()).days
                    total_days += max(0, days)
            avg_resolution_time = total_days / resolved_complaints_with_dates.count()
        
        # Performance score
        performance_score = 0
        if total_complaints > 0:
            resolution_rate = (resolved_complaints / total_complaints) * 100
            performance_score = min(100, resolution_rate + (100 - avg_resolution_time * 2))
        
        stats_data = {
            'totalComplaints': total_complaints,
            'resolvedComplaints': resolved_complaints,
            'pendingComplaints': pending_complaints,
            'inProgressComplaints': in_progress_complaints,
            'overdueComplaints': 0,  # Can be calculated based on SLA
            'averageResolutionTime': round(avg_resolution_time, 1),
            'performanceScore': round(performance_score),
            'todayComplaints': today_complaints,
            'weeklyComplaints': weekly_complaints
        }
        
        return Response(stats_data)
        
    except Exception as e:
        print(f"Error in officer_dashboard_stats: {str(e)}")
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def officer_recent_complaints(request):
    """
    Get recent complaints for officer
    """
    user = request.user
    
    try:
        from complaints.models import Complaint
        
        complaints = Complaint.objects.filter(officer_id=user).order_by('-current_time')[:10]
        
        complaints_data = []
        for complaint in complaints:
            complaints_data.append({
                'id': complaint.id,
                'title': complaint.title,
                'category': complaint.Category.name if complaint.Category else 'Unknown',
                'status': complaint.status,
                'priority': getattr(complaint, 'priority', 'Medium'),
                'date': complaint.current_time.strftime('%Y-%m-%d') if complaint.current_time else '',
                'citizenName': complaint.user.get_full_name() or complaint.user.email if complaint.user else 'Unknown',
                'location': complaint.location or 'Not specified'
            })
        
        return Response(complaints_data)
        
    except Exception as e:
        print(f"Error in officer_recent_complaints: {str(e)}")
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def officer_monthly_trends(request):
    """
    Get monthly complaint trends for officer
    """
    user = request.user
    
    try:
        from complaints.models import Complaint
        from datetime import datetime, timedelta
        from django.db.models import Count
        
        # Get last 6 months of data
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=180)
        
        # Get officer profile for this user
        officer = _get_officer_for_user(user)
        if not officer:
            return Response({'error': 'Officer profile not found'}, status=404)
        
        complaints = Complaint.objects.filter(
            officer_id=officer,
            current_time__date__gte=start_date,
            current_time__date__lte=end_date
        ).extra(
            select={'month': 'strftime("%%b", current_time)'}
        ).values('month').annotate(count=Count('id')).order_by('current_time__date')
        
        monthly_data = []
        for item in complaints:
            monthly_data.append({
                'month': item['month'],
                'complaints': item['count']
            })
        
        return Response(monthly_data)
        
    except Exception as e:
        print(f"Error in officer_monthly_trends: {str(e)}")
        return Response({'error': str(e)}, status=500)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def officer_profile(request):
    """
    GET: Get officer profile information
    PUT: Update officer profile information
    """
    user = request.user
    
    officer = _get_officer_for_user(user)
    
    if request.method == 'GET':
        # Calculate performance metrics
        from complaints.models import Complaint
        from datetime import datetime, timedelta
        
        complaints = Complaint.objects.filter(officer_id=officer) if officer else Complaint.objects.none()
        total_complaints = complaints.count()
        resolved_complaints = complaints.filter(status='resolved').count()
        pending_complaints = complaints.filter(status='Pending').count()
        
        # Calculate average resolution time
        # Since Complaint model doesn't have updated_at field, we'll use a fixed average
        avg_resolution_time = 2.5  # Default average resolution time in days
        
        # Calculate performance score
        performance_score = 0
        if total_complaints > 0:
            resolution_rate = (resolved_complaints / total_complaints) * 100
            performance_score = min(100, resolution_rate + (100 - avg_resolution_time * 2))
        
        profile_data = {
            'id': user.id,
            'name': user.get_full_name() or user.email,
            'email': user.email,
            'phone': getattr(user, 'mobile_number', None),
            'address': getattr(user, 'address', None),
            'department': getattr(officer, 'department', None) if officer else None,
            'designation': 'Officer',
            'joinDate': user.date_joined.strftime('%Y-%m-%d') if user.date_joined else None,
            'totalComplaintsHandled': total_complaints,
            'complaintsResolved': resolved_complaints,
            'pendingComplaints': pending_complaints,
            'averageResolutionTime': round(avg_resolution_time, 1),
            'performanceScore': round(performance_score),
            'isAvailable': officer.is_available if officer else True,
            'lastLogin': user.last_login.strftime('%Y-%m-%d %H:%M') if user.last_login else None
        }
        
        return Response(profile_data)
    
    elif request.method == 'PUT':
        # Update user profile information
        data = request.data
        
        if 'name' in data:
            user.first_name = data['name'].split(' ')[0] if data['name'] else ''
            user.last_name = ' '.join(data['name'].split(' ')[1:]) if len(data['name'].split(' ')) > 1 else ''
        
        if 'phone' in data:
            user.mobile_number = data['phone']
        
        if 'address' in data:
            user.address = data['address']
        
        user.save()
        
        return Response({
            'message': 'Profile updated successfully',
            'name': user.get_full_name() or user.email,
            'phone': user.mobile_number,
            'address': user.address
        })
        
    # Note: no outer try/except here; specific errors will propagate to Django's error handlers.
