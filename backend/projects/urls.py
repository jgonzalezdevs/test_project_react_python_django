from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ProjectMembershipViewSet, ProjectViewSet

router = DefaultRouter()
router.register(r"projects", ProjectViewSet, basename="project")
router.register(r"memberships", ProjectMembershipViewSet, basename="projectmembership")

urlpatterns = [
    path("", include(router.urls)),
]
