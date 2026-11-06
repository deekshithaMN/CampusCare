from datetime import datetime, timezone
from django.db import transaction
from django.db.models import Count
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import Complaint, ComplaintSupport, StatusLog, ComplaintStatus
from .serializers import (
    ComplaintSerializer,
    ComplaintCreateSerializer,
    ComplaintStatusUpdateSerializer,
    DuplicateCheckRequestSerializer
)
from authentication.models import User, UserRole
from authentication.permissions import IsStaffOrAdmin
from services.duplicate_service import find_candidate_duplicates

class ComplaintViewSet(viewsets.ModelViewSet):
    """
    CRUD and actions for Campus Complaints.
    """
    queryset = Complaint.objects.all().select_related('student', 'assigned_staff').prefetch_related('supports', 'status_logs')
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.action == 'create':
            return ComplaintCreateSerializer
        return ComplaintSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get('category')
        status_filter = self.request.query_params.get('status')
        ordering = self.request.query_params.get('ordering', '-priority_score')

        if category:
            qs = qs.filter(category=category.upper())
        if status_filter:
            qs = qs.filter(status=status_filter.upper())

        # Dynamic refresh of hours_pending for top active complaints
        # Keeps priorities up-to-date without background cron requirements
        for complaint in qs[:20]:
            if complaint.status in [ComplaintStatus.PENDING, ComplaintStatus.IN_PROGRESS]:
                complaint.recalculate_priority(save=True)

        return qs.order_by(ordering)

    @action(detail=False, methods=['post'], url_path='check-duplicate')
    def check_duplicate(self, request):
        """
        Scans active complaints in the same category/location for duplicates.
        """
        serializer = DuplicateCheckRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        active_complaints = Complaint.objects.filter(
            status__in=[ComplaintStatus.PENDING, ComplaintStatus.IN_PROGRESS],
            category=data['category'].upper()
        ).values('id', 'title', 'description', 'location', 'category')

        candidates = find_candidate_duplicates(
            new_title=data['title'],
            new_description=data['description'],
            new_location=data['location'],
            existing_complaints=list(active_complaints)
        )

        return Response({
            "duplicates_found": len(candidates) > 0,
            "candidates_count": len(candidates),
            "candidates": candidates
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='support')
    def support_complaint(self, request, pk=None):
        """
        Supports/upvotes an existing complaint. Recalculates priority score.
        """
        complaint = self.get_object()

        # Prevent double support
        support, created = ComplaintSupport.objects.get_or_create(
            complaint=complaint,
            user=request.user
        )

        if not created:
            # If already supported, user can remove support (toggle)
            support.delete()
            action_done = "removed"
        else:
            action_done = "added"

        # Update priority score and breakdown
        updated_breakdown = complaint.recalculate_priority(save=True)

        return Response({
            "message": f"Support {action_done} successfully.",
            "action": action_done,
            "supporters_count": complaint.supports.count(),
            "new_priority_score": complaint.priority_score,
            "breakdown": updated_breakdown['breakdown']
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], url_path='status', permission_classes=[IsStaffOrAdmin])
    def update_status(self, request, pk=None):
        """
        Allows Maintenance Staff or Admins to assign staff, add notes, and change status.
        """
        complaint = self.get_object()
        serializer = ComplaintStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['status']
        staff_id = serializer.validated_data.get('assigned_staff_id')
        notes = serializer.validated_data.get('notes', '')

        old_status = complaint.status

        with transaction.atomic():
            complaint.status = new_status

            if staff_id:
                try:
                    staff_user = User.objects.get(id=staff_id)
                    complaint.assigned_staff = staff_user
                except User.DoesNotExist:
                    return Response({"error": "Staff member not found."}, status=status.HTTP_404_NOT_FOUND)
            elif not complaint.assigned_staff and request.user.role in [UserRole.STAFF, UserRole.ADMIN]:
                # Auto-assign to acting staff if unassigned
                complaint.assigned_staff = request.user

            if new_status == ComplaintStatus.RESOLVED:
                complaint.resolved_at = datetime.now(timezone.utc)
            elif old_status == ComplaintStatus.RESOLVED and new_status != ComplaintStatus.RESOLVED:
                complaint.resolved_at = None

            complaint.save()

            # Record audit trail
            StatusLog.objects.create(
                complaint=complaint,
                changed_by=request.user,
                old_status=old_status,
                new_status=new_status,
                notes=notes
            )

        return Response(ComplaintSerializer(complaint, context={'request': request}).data)

class DashboardStatsView(APIView):
    """
    Returns aggregated KPI metrics and category distribution for the staff dashboard.
    """
    permission_classes = [IsStaffOrAdmin]

    def get(self, request):
        total = Complaint.objects.count()
        pending = Complaint.objects.filter(status=ComplaintStatus.PENDING).count()
        in_progress = Complaint.objects.filter(status=ComplaintStatus.IN_PROGRESS).count()
        resolved = Complaint.objects.filter(status=ComplaintStatus.RESOLVED).count()

        # Category breakdown
        category_counts = (
            Complaint.objects.values('category')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        # Top 5 most urgent active complaints
        urgent_complaints = Complaint.objects.filter(
            status__in=[ComplaintStatus.PENDING, ComplaintStatus.IN_PROGRESS]
        ).order_by('-priority_score')[:5]

        urgent_serializer = ComplaintSerializer(urgent_complaints, many=True, context={'request': request})

        return Response({
            "summary": {
                "total": total,
                "pending": pending,
                "in_progress": in_progress,
                "resolved": resolved,
            },
            "category_distribution": {item['category']: item['count'] for item in category_counts},
            "urgent_complaints": urgent_serializer.data
        })
