import uuid
from django.db import models
from django.conf import settings
from services.priority_service import calculate_explainable_priority

class ComplaintCategory(models.TextChoices):
    PLUMBING = 'PLUMBING', 'Plumbing'
    ELECTRICAL = 'ELECTRICAL', 'Electrical'
    HVAC = 'HVAC', 'HVAC / Climate'
    STRUCTURAL = 'STRUCTURAL', 'Structural / Doors / Windows'
    FURNITURE = 'FURNITURE', 'Furniture / Desks'
    CLEANLINESS = 'CLEANLINESS', 'Cleanliness / Janitorial'
    OTHER = 'OTHER', 'Other'

class ComplaintSeverity(models.TextChoices):
    LOW = 'LOW', 'Low'
    MEDIUM = 'MEDIUM', 'Medium'
    HIGH = 'HIGH', 'High'
    CRITICAL = 'CRITICAL', 'Critical'

class ComplaintStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending Review'
    IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
    RESOLVED = 'RESOLVED', 'Resolved'
    CANCELLED = 'CANCELLED', 'Cancelled'

class Complaint(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='complaints'
    )
    assigned_staff = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_complaints'
    )
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=30, choices=ComplaintCategory.choices)
    location = models.CharField(max_length=255, help_text="e.g. Science Block, 1st Floor Restroom")
    description = models.TextField()
    severity = models.CharField(max_length=20, choices=ComplaintSeverity.choices, default=ComplaintSeverity.MEDIUM)
    status = models.CharField(max_length=20, choices=ComplaintStatus.choices, default=ComplaintStatus.PENDING)
    
    # Files are stored on filesystem/media storage; path stored in PostgreSQL
    image = models.ImageField(upload_to='complaints/%Y/%m/', null=True, blank=True)
    
    priority_score = models.FloatField(default=0.0, db_index=True)
    priority_breakdown = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-priority_score', '-created_at']

    def __str__(self):
        return f"[{self.category}] {self.title} - {self.status} (Score: {self.priority_score})"

    def recalculate_priority(self, save=True):
        """
        Calculates and updates explainable priority based on severity, supporters, and pending hours.
        """
        supporters_count = self.supports.count()
        result = calculate_explainable_priority(
            severity=self.severity,
            supporters_count=supporters_count,
            created_at=self.created_at
        )
        self.priority_score = result['priority_score']
        self.priority_breakdown = result['breakdown']
        if save:
            self.save(update_fields=['priority_score', 'priority_breakdown', 'updated_at'])
        return result

class ComplaintSupport(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='supports')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='supported_complaints')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('complaint', 'user')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} supported {self.complaint.title}"

class StatusLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='status_logs')
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    old_status = models.CharField(max_length=20)
    new_status = models.CharField(max_length=20)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.complaint.title}: {self.old_status} -> {self.new_status}"
