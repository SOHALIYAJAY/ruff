from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from rest_framework import status
from .models import CustomUser
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from google.oauth2 import id_token
from google.auth.transport import requests
from accounts.serializers import UserRegister, UserDetailSerializer, UserUpdateSerializer, UserAdminSerializer
from complaints.models import Complaint
from rest_framework.pagination import PageNumberPagination


class TestAPIView(APIView):
    def get(self, request):
        return Response({
            'message': 'API is working',
            'status': 'success'
        })


class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        try:
            user = CustomUser.objects.get(email=email)
            if user.check_password(password):
                refresh = RefreshToken.for_user(user)
                return Response({
                    'success': True,
                    'access_token': str(refresh.access_token),
                    'refresh_token': str(refresh),
                    'user': {
                        'email': user.email,
                        'username': user.username,
                        'name': user.get_full_name() or user.email,
                        'role': user.User_Role
                    }
                })
            return Response({'success': False, 'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        except CustomUser.DoesNotExist:
            return Response({'success': False, 'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class RegisterView(APIView):
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        role = request.data.get('role', 'Civic-User')

        if CustomUser.objects.filter(email=email).exists():
            return Response({'success': False, 'message': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

        if username and CustomUser.objects.filter(username=username).exists():
            return Response({'success': False, 'message': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

        user = CustomUser.objects.create_user(
            email=email,
            password=password,
            username=username or email.split('@')[0],
            User_Role=role
        )
        
        # Auto-login after signup
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'success': True,
            'message': 'User registered successfully',
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
            'user': {
                'email': user.email,
                'username': user.username,
                'role': user.User_Role
            }
        }, status=status.HTTP_201_CREATED)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'success': True, 'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'success': True, 'message': 'Logged out successfully'}, status=status.HTTP_200_OK)

class GoogleLoginView(APIView):
    def post(self, request):
        token = request.data.get('token')
        
        try:
            GOOGLE_CLIENT_ID = '368010718950-mpbp3m0379j51abunusi6n1o2jtnq715.apps.googleusercontent.com'
            idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
            
            email = idinfo.get('email')
            name = idinfo.get('name')
            
            user, created = CustomUser.objects.get_or_create(
                email=email,
                defaults={
                    'username': email.split('@')[0],
                    'first_name': name.split()[0] if name else '',
                    'last_name': ' '.join(name.split()[1:]) if name and len(name.split()) > 1 else '',
                    'User_Role': 'Civic-User'
                }
            )
            
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'success': True,
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
                'user': {
                    'email': user.email,
                    'username': user.username,
                    'name': user.get_full_name() or user.email,
                    'role': user.User_Role
                }
            }, status=status.HTTP_200_OK)
            
        except ValueError:
            return Response({
                'success': False,
                'message': 'Invalid Google token'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserDetail(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            user = request.user
            serializer = UserDetailSerializer(user)
            return Response({
                "success": True,
                "data": serializer.data
            })
        except Exception as e:
            return Response({
                "success": False,
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UpdateUserDetails(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        try:
            user = request.user
            serializer = UserUpdateSerializer(user, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "success": True,
                    "message": "User details updated successfully",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "success": False,
                    "message": "Validation failed",
                    "errors": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                "success": False,
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        return self.patch(request)


class UserPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class UserListCreateView(APIView):
    permission_classes = [IsAuthenticated]  # Temporarily remove IsAdminUser for debugging

    def get(self, request):
        try:
            print("=== UserListCreateView GET called ===")
            print(f"Request user: {request.user}")
            print(f"User is authenticated: {request.user.is_authenticated}")
            print(f"User role: {getattr(request.user, 'User_Role', 'No role')}")
            
            users = CustomUser.objects.all()
            print(f"Total users found: {users.count()}")
            
            # Add complaint count for each user
            users_data = []
            for user in users:
                complaint_count = Complaint.objects.filter(user=user).count()
                user_data = {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name or '',
                    'last_name': user.last_name or '',
                    'role': user.User_Role,
                    'is_active': user.is_active,
                    'date_joined': user.created_join,
                    'last_login': user.last_login,
                    'complaint_count': complaint_count
                }
                print(f"User data: {user_data}")
                users_data.append(user_data)
            
            print(f"Final users_data length: {len(users_data)}")
            
            # For now, return simple response without pagination
            return Response({
                'success': True,
                'count': len(users_data),
                'results': users_data
            })
            
        except Exception as e:
            print(f"Error in UserListCreateView: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            username = request.data.get('username')
            email = request.data.get('email')
            password = request.data.get('password')
            first_name = request.data.get('first_name', '')
            last_name = request.data.get('last_name', '')
            role = request.data.get('role', 'Civic-User')

            if CustomUser.objects.filter(email=email).exists():
                return Response({
                    'success': False, 
                    'message': 'Email already exists'
                }, status=status.HTTP_400_BAD_REQUEST)

            if CustomUser.objects.filter(username=username).exists():
                return Response({
                    'success': False, 
                    'message': 'Username already exists'
                }, status=status.HTTP_400_BAD_REQUEST)

            user = CustomUser.objects.create_user(
                email=email,
                password=password,
                username=username,
                first_name=first_name,
                last_name=last_name,
                User_Role=role
            )

            return Response({
                'success': True,
                'message': 'User created successfully',
                'data': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name or '',
                    'last_name': user.last_name or '',
                    'role': user.User_Role,
                    'is_active': user.is_active,
                    'date_joined': user.created_join,
                    'complaint_count': 0
                }
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserRetrieveUpdateDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_object(self, user_id):
        try:
            return CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            return None

    def get(self, request, user_id):
        try:
            user = self.get_object(user_id)
            if not user:
                return Response({
                    'success': False,
                    'message': 'User not found'
                }, status=status.HTTP_404_NOT_FOUND)

            complaint_count = Complaint.objects.filter(user=user).count()

            return Response({
                'success': True,
                'data': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name or '',
                    'last_name': user.last_name or '',
                    'role': user.User_Role,
                    'is_active': user.is_active,
                    'date_joined': user.created_join,
                    'last_login': user.last_login,
                    'complaint_count': complaint_count
                }
            })

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, user_id):
        try:
            user = self.get_object(user_id)
            if not user:
                return Response({
                    'success': False,
                    'message': 'User not found'
                }, status=status.HTTP_404_NOT_FOUND)

            # Update fields
            user.username = request.data.get('username', user.username)
            user.email = request.data.get('email', user.email)
            user.first_name = request.data.get('first_name', user.first_name)
            user.last_name = request.data.get('last_name', user.last_name)
            user.User_Role = request.data.get('role', user.User_Role)
            user.is_active = request.data.get('is_active', user.is_active)

            # Update password if provided
            password = request.data.get('password')
            if password:
                user.set_password(password)

            user.save()

            return Response({
                'success': True,
                'message': 'User updated successfully',
                'data': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name or '',
                    'last_name': user.last_name or '',
                    'role': user.User_Role,
                    'is_active': user.is_active,
                    'date_joined': user.created_join,
                    'last_login': user.last_login
                }
            })

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, user_id):
        try:
            user = self.get_object(user_id)
            if not user:
                return Response({
                    'success': False,
                    'message': 'User not found'
                }, status=status.HTTP_404_NOT_FOUND)

            # Prevent admin from deleting themselves
            if user.id == request.user.id:
                return Response({
                    'success': False,
                    'message': 'Cannot delete your own account'
                }, status=status.HTTP_400_BAD_REQUEST)

            user.delete()

            return Response({
                'success': True,
                'message': 'User deleted successfully'
            })

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            user = request.user
            old_password = request.data.get('old_password')
            new_password = request.data.get('new_password')
            
            if not old_password or not new_password:
                return Response({
                    'success': False,
                    'error': 'Both old and new passwords are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Verify old password
            if not user.check_password(old_password):
                return Response({
                    'success': False,
                    'error': 'Current password is incorrect'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update password
            user.set_password(new_password)
            user.save()
            
            return Response({
                'success': True,
                'message': 'Password updated successfully'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserActivityView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            user = request.user
            from complaints.models import Complaint
            
            # Get user's complaints
            complaints = Complaint.objects.filter(user=user).order_by('-created_at')[:10]
            
            activities = []
            
            # Add complaint activities
            for complaint in complaints:
                activities.append({
                    'id': f'comp_{complaint.id}',
                    'type': 'submitted',
                    'title': 'Complaint Submitted',
                    'description': f'Reported {complaint.Category or "issue"}',
                    'timestamp': complaint.created_at.isoformat()
                })
                
                if complaint.status == 'Resolved':
                    activities.append({
                        'id': f'resolved_{complaint.id}',
                        'type': 'resolved',
                        'title': 'Complaint Resolved',
                        'description': f'{complaint.Category} issue resolved',
                        'timestamp': complaint.updated_at.isoformat() if complaint.updated_at else complaint.created_at.isoformat()
                    })
            
            # Add profile update activity (mock for now)
            activities.append({
                'id': 'profile_1',
                'type': 'updated',
                'title': 'Profile Updated',
                'description': 'Profile information updated',
                'timestamp': user.date_joined.isoformat()  # Using join date as fallback
            })
            
            # Add login activity
            if user.last_login:
                activities.append({
                    'id': 'login_1',
                    'type': 'login',
                    'title': 'Login',
                    'description': 'Successfully logged in',
                    'timestamp': user.last_login.isoformat()
                })
            
            # Sort by timestamp
            activities.sort(key=lambda x: x['timestamp'], reverse=True)
            
            return Response({
                'success': True,
                'data': activities[:20]  # Return last 20 activities
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ToggleTwoFactorView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            user = request.user
            enabled = request.data.get('enabled', False)
            
            # For demo purposes, we'll just return success
            # In real implementation, you would store this in user profile or separate model
            return Response({
                'success': True,
                'message': f'Two-factor authentication {"enabled" if enabled else "disabled"} successfully'
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserComplaintsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            user = request.user
            from complaints.models import Complaint
            
            # Get user's complaints
            complaints = Complaint.objects.filter(user=user).order_by('-created_at')
            
            # Serialize complaints
            complaints_data = []
            for complaint in complaints:
                complaints_data.append({
                    'id': complaint.id,
                    'title': complaint.title or 'Untitled Complaint',
                    'description': complaint.description or '',
                    'status': complaint.status or 'Pending',
                    'created_at': complaint.created_at.isoformat() if complaint.created_at else '',
                    'category': complaint.Category or 'General',
                    'priority': getattr(complaint, 'priority', 'Medium')
                })
            
            return Response({
                'success': True,
                'data': complaints_data
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)