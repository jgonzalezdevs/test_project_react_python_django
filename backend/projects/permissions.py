from rest_framework import permissions

from authentication.models import User
from .models import Project, ProjectMembership


class IsAdminOrCollaborator(permissions.BasePermission):
    """Allow write actions only to admins or collaborators.

    Read actions are allowed if the user is authenticated and a member of the project
    (the queryset in views should already be filtered appropriately).
    """

    def has_object_permission(self, request, view, obj: Project) -> bool:
        if request.method in permissions.SAFE_METHODS:
            return True
        user: User = request.user
        if not user.is_authenticated:
            return False
        if user.role == User.Roles.ADMIN:
            return True
        # Collaborators who created the project or are members can write
        if user.role == User.Roles.COLLABORATOR:
            return ProjectMembership.objects.filter(project=obj, user=user).exists() or obj.created_by_id == user.id
        return False


class IsProjectMember(permissions.BasePermission):
    """Allow access to objects only if the user is a member of the related project or admin."""

    def has_object_permission(self, request, view, obj: Project) -> bool:
        user: User = request.user
        if not user.is_authenticated:
            return False
        if user.role == User.Roles.ADMIN:
            return True
        return ProjectMembership.objects.filter(project=obj, user=user).exists() or obj.created_by_id == user.id
