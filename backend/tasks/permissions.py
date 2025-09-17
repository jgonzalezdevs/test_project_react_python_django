from rest_framework import permissions

from authentication.models import User
from projects.models import ProjectMembership
from .models import Task


class IsAdminOrProjectCollaborator(permissions.BasePermission):
    """Allow write actions only to admins or collaborators of the related project."""

    def has_object_permission(self, request, view, obj: Task) -> bool:
        if request.method in permissions.SAFE_METHODS:
            return True
        user: User = request.user
        if not user.is_authenticated:
            return False
        if user.role == User.Roles.ADMIN:
            return True
        # Collaborators assigned to the project can write
        return ProjectMembership.objects.filter(project=obj.project, user=user, role=ProjectMembership.Role.COLLABORATOR).exists() or obj.created_by_id == user.id

    def has_permission(self, request, view) -> bool:
        return request.user and request.user.is_authenticated
