"""
Seed script to populate initial demo accounts and complaints for CampusCare.
Run: python seed_demo.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'campuscare_core.settings')
django.setup()

from authentication.models import User, UserRole
from complaints.models import Complaint, ComplaintCategory, ComplaintSeverity, ComplaintStatus
from services.priority_service import calculate_explainable_priority

def seed():
    print("[*] Seeding CampusCare Demo Data...")

    # 1. Create Student Accounts
    student1, _ = User.objects.get_or_create(
        email='student@campus.edu',
        defaults={'username': 'alex_student', 'role': UserRole.STUDENT}
    )
    student1.set_password('demo1234')
    student1.save()

    student2, _ = User.objects.get_or_create(
        email='sam@campus.edu',
        defaults={'username': 'sam_student', 'role': UserRole.STUDENT}
    )
    student2.set_password('demo1234')
    student2.save()

    # 2. Create Staff Account
    staff1, _ = User.objects.get_or_create(
        email='staff@campus.edu',
        defaults={'username': 'marcus_facilities', 'role': UserRole.STAFF, 'department': 'Plumbing & Facilities', 'is_staff': True}
    )
    staff1.set_password('demo1234')
    staff1.save()

    print("[+] Created Demo Users:")
    print("    - Student: student@campus.edu (password: demo1234)")
    print("    - Student: sam@campus.edu (password: demo1234)")
    print("    - Staff:   staff@campus.edu (password: demo1234)")

    # 3. Create Sample Demo Complaints if none exist
    if Complaint.objects.count() == 0:
        c1_pri = calculate_explainable_priority('HIGH', 0)
        c1 = Complaint.objects.create(
            student=student1,
            title="Broken water tap flooding 1st floor restroom",
            category=ComplaintCategory.PLUMBING,
            location="Science Block - 1st Floor Restroom",
            description="Continuous heavy water flow from main tap sink #2. Puddle spreading to hallway.",
            severity=ComplaintSeverity.HIGH,
            status=ComplaintStatus.PENDING,
            priority_score=c1_pri['priority_score'],
            priority_breakdown=c1_pri['breakdown']
        )

        c2_pri = calculate_explainable_priority('LOW', 0)
        c2 = Complaint.objects.create(
            student=student2,
            title="Flickering fluorescent lights in Room 101",
            category=ComplaintCategory.ELECTRICAL,
            location="Engineering Hall - Room 101",
            description="Two light tubes are buzzing and blinking intermittently during lectures.",
            severity=ComplaintSeverity.LOW,
            status=ComplaintStatus.PENDING,
            priority_score=c2_pri['priority_score'],
            priority_breakdown=c2_pri['breakdown']
        )

        c3_pri = calculate_explainable_priority('MEDIUM', 0)
        c3 = Complaint.objects.create(
            student=student1,
            title="AC unit blowing warm air in Auditorium",
            category=ComplaintCategory.HVAC,
            location="Auditorium Main Stage",
            description="Main cooling fan is running but temperature remains at 82F despite thermostat set to 68F.",
            severity=ComplaintSeverity.MEDIUM,
            status=ComplaintStatus.PENDING,
            priority_score=c3_pri['priority_score'],
            priority_breakdown=c3_pri['breakdown']
        )

        print(f"[+] Created 3 Initial Complaints: '{c1.title}', '{c2.title}', '{c3.title}'")
    else:
        print("[i] Existing complaints found, skipping duplicate seeding.")

    print("[OK] Database successfully seeded!")

if __name__ == '__main__':
    seed()
