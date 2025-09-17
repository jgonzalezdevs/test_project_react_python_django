from rest_framework import serializers

from authentication.models import User
from .models import Project, ProjectMembership


class ProjectMembershipSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        model = ProjectMembership
        fields = ["id", "project", "user", "role", "assigned_at"]
        read_only_fields = ["id", "assigned_at"]


class ProjectSerializer(serializers.ModelSerializer):
    created_by = serializers.PrimaryKeyRelatedField(read_only=True)
    members = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "description",
            "start_date",
            "end_date",
            "status",
            "created_by",
            "created_at",
            "updated_at",
            "members",
        ]
        read_only_fields = ["id", "created_by", "created_at", "updated_at", "members"]
