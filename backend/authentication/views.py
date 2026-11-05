from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from .serializers import (
    UserRegistrationSerializer, 
    UserSummarySerializer, 
    CustomTokenObtainPairSerializer
)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = UserSummarySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class StaffListView(generics.ListAPIView):
    """
    Returns list of staff and admin users for assignment dropdowns.
    """
    serializer_class = UserSummarySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        from .models import UserRole
        return User.objects.filter(role__in=[UserRole.STAFF, UserRole.ADMIN])

class UserDirectoryView(generics.ListAPIView):
    """
    Returns directory of campus users for Admin view.
    """
    serializer_class = UserSummarySerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = User.objects.all().order_by('-date_joined')
