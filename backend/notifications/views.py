from django.db import models
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from authentication.models import User
from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    """ViewSet for user notifications.

    - Users can read their own notifications and mark them as read/unread.
    - Admins can see all notifications.
    """

    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user: User = self.request.user
        qs = Notification.objects.select_related("user")
        if user.role == User.Roles.ADMIN:
            return qs
        return qs.filter(user=user)

    def perform_create(self, serializer):
        # By default, create notification for the current user unless specified and the user is admin
        user: User = self.request.user
        target_user = self.request.data.get("user")
        if target_user and user.role == User.Roles.ADMIN:
            return serializer.save()
        return serializer.save(user=user)

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = True
        notif.save(update_fields=["is_read"])
        return Response({"detail": "marked as read"})

    @action(detail=True, methods=["post"])
    def mark_unread(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = False
        notif.save(update_fields=["is_read"])
        return Response({"detail": "marked as unread"})

