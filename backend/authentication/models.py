import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser

class UserRole(models.TextChoices):
    STUDENT = 'STUDENT', 'Student'
    STAFF = 'STAFF', 'Staff'
    ADMIN = 'ADMIN', 'Admin'

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=UserRole.choices, default=UserRole.STUDENT)
    department = models.CharField(max_length=100, blank=True, null=True, help_text="e.g. Electrical, Plumbing, Facilities")

    # Email is the primary login field
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.username} ({self.role})"
