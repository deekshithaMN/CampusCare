from rest_framework import serializers
from .models import Complaint, ComplaintSupport, StatusLog
from authentication.serializers import UserSummarySerializer
from services.image_service import process_and_sanitize_image
from services.priority_service import calculate_explainable_priority

class StatusLogSerializer(serializers.ModelSerializer):
    changed_by_username = serializers.CharField(source='changed_by.username', read_only=True)

    class Meta:
        model = StatusLog
        fields = ['id', 'old_status', 'new_status', 'notes', 'changed_by_username', 'created_at']

class ComplaintSerializer(serializers.ModelSerializer):
    student = UserSummarySerializer(read_only=True)
    assigned_staff = UserSummarySerializer(read_only=True)
    supporters_count = serializers.SerializerMethodField()
    has_supported = serializers.SerializerMethodField()
    status_logs = StatusLogSerializer(many=True, read_only=True)

    class Meta:
        model = Complaint
        fields = [
            'id', 'student', 'assigned_staff', 'title', 'category',
            'location', 'description', 'severity', 'status',
            'image', 'priority_score', 'priority_breakdown',
            'supporters_count', 'has_supported', 'status_logs',
            'created_at', 'updated_at', 'resolved_at'
        ]
        read_only_fields = ['id', 'student', 'priority_score', 'priority_breakdown', 'created_at', 'updated_at', 'resolved_at']

    def get_supporters_count(self, obj):
        return obj.supports.count()

    def get_has_supported(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.supports.filter(user=request.user).exists()
        return False

class ComplaintCreateSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Complaint
        fields = ['id', 'title', 'category', 'location', 'description', 'severity', 'image']

    def create(self, validated_data):
        request = self.context['request']
        image_file = validated_data.get('image')

        # Sanitize and strip EXIF from image if provided
        if image_file:
            try:
                sanitized_file = process_and_sanitize_image(image_file)
                validated_data['image'] = sanitized_file
            except ValueError as e:
                raise serializers.ValidationError({"image": str(e)})

        # Compute initial priority breakdown
        severity = validated_data.get('severity', 'MEDIUM')
        priority_res = calculate_explainable_priority(severity=severity, supporters_count=0)

        complaint = Complaint.objects.create(
            student=request.user,
            priority_score=priority_res['priority_score'],
            priority_breakdown=priority_res['breakdown'],
            **validated_data
        )
        return complaint

class ComplaintStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Complaint._meta.get_field('status').choices)
    assigned_staff_id = serializers.UUIDField(required=False, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True, default='')

class DuplicateCheckRequestSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
    description = serializers.CharField(allow_blank=True, default='')
    category = serializers.CharField(max_length=30)
    location = serializers.CharField(max_length=255)
