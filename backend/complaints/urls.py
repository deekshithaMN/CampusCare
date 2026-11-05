from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ComplaintViewSet, DashboardStatsView

router = DefaultRouter()
router.register(r'', ComplaintViewSet, basename='complaint')

urlpatterns = [
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('', include(router.urls)),
]
