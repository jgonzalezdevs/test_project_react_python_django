from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import models

from authentication.models import User
from .models import Project, ProjectMembership
from .permissions import IsAdminOrCollaborator, IsProjectMember
from .serializers import ProjectMembershipSerializer, ProjectSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    """CRUD for projects with role-based permissions and membership filtering."""

    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated & IsAdminOrCollaborator]

    def get_queryset(self):
        user: User = self.request.user
        if user.role == User.Roles.ADMIN:
            return Project.objects.all().select_related("created_by").prefetch_related("members")
        # Show projects the user created or is a member of
        return (
            Project.objects.filter(models.Q(created_by=user) | models.Q(members=user))
            .distinct()
            .select_related("created_by")
            .prefetch_related("members")
        )

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["get"], permission_classes=[permissions.IsAuthenticated & IsProjectMember])
    def memberships(self, request, pk=None):
        project = self.get_object()
        qs = ProjectMembership.objects.filter(project=project).select_related("user")
        return Response(ProjectMembershipSerializer(qs, many=True).data)


class ProjectMembershipViewSet(viewsets.ModelViewSet):
    """Manage user assignments to projects (collaborators and viewers)."""

    serializer_class = ProjectMembershipSerializer
    permission_classes = [permissions.IsAuthenticated & IsAdminOrCollaborator]

    def get_queryset(self):
        user: User = self.request.user
        if user.role == User.Roles.ADMIN:
            return ProjectMembership.objects.select_related("project", "user")
        # Collaborators can manage memberships for projects they created or belong to
        return ProjectMembership.objects.filter(
            models.Q(project__created_by=user) | models.Q(project__members=user)
        ).select_related("project", "user")

