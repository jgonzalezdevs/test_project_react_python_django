from django.db import models
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from authentication.models import User
from projects.models import ProjectMembership
from .models import Comment, Task
from .permissions import IsAdminOrProjectCollaborator
from .serializers import CommentSerializer, TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    """CRUD operations for tasks with project-based permission controls."""

    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated & IsAdminOrProjectCollaborator]

    def get_queryset(self):
        user: User = self.request.user
        qs = Task.objects.select_related("project", "assignee", "created_by")
        if user.role == User.Roles.ADMIN:
            return qs
        # For non-admins, show tasks in projects they belong to or created
        member_project_ids = ProjectMembership.objects.filter(user=user).values_list("project_id", flat=True)
        return qs.filter(models.Q(project_id__in=member_project_ids) | models.Q(created_by=user)).distinct()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["get", "post"], permission_classes=[permissions.IsAuthenticated])
    def comments(self, request, pk=None):
        task = self.get_object()
        if request.method == "GET":
            qs = task.comments.select_related("author").all()
            return Response(CommentSerializer(qs, many=True).data)
        # POST: create comment
        serializer = CommentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(task=task, author=request.user)
        return Response(serializer.data)


class CommentViewSet(viewsets.ModelViewSet):
    """Manage comments as a separate endpoint if needed."""

    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user: User = self.request.user
        qs = Comment.objects.select_related("task", "author", "task__project")
        if user.role == User.Roles.ADMIN:
            return qs
        member_project_ids = ProjectMembership.objects.filter(user=user).values_list("project_id", flat=True)
        return qs.filter(
            models.Q(task__project_id__in=member_project_ids) | models.Q(author=user)
        ).distinct()

