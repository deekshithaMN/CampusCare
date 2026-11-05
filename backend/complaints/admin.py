from django.contrib import admin
from .models import Complaint, ComplaintSupport, StatusLog

@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'location', 'severity', 'status', 'priority_score', 'created_at')
    list_filter = ('category', 'status', 'severity')
    search_fields = ('title', 'location', 'description')
    readonly_fields = ('priority_score', 'priority_breakdown', 'created_at', 'updated_at', 'resolved_at')

@admin.register(ComplaintSupport)
class ComplaintSupportAdmin(admin.ModelAdmin):
    list_display = ('complaint', 'user', 'created_at')

@admin.register(StatusLog)
class StatusLogAdmin(admin.ModelAdmin):
    list_display = ('complaint', 'old_status', 'new_status', 'changed_by', 'created_at')
