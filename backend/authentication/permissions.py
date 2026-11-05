from rest_framework.permissions import BasePermission
from .models import UserRole

class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role == UserRole.STUDENT
        )

class IsStaffOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role in [UserRole.STAFF, UserRole.ADMIN] or request.user.is_staff)
        )

class IsAdminUserOnly(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role == UserRole.ADMIN or request.user.is_superuser)
        )
