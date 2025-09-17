from django.db import models
from django.conf import settings


class Project(models.Model):
    """Represents a project within the platform.

    Only admins and collaborators can create or modify projects. Viewers can only
    read projects they are members of via `ProjectMembership`.
    """

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        IN_PROGRESS = "in_progress", "In Progress"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="projects_created",
        help_text="User who created the project.",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through="ProjectMembership",
        related_name="projects",
        blank=True,
        help_text="Users assigned to this project via memberships.",
    )

    class Meta:
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["start_date", "end_date"]),
        ]
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.name} ({self.status})"


class ProjectMembership(models.Model):
    """Links a user to a project with a project-specific role."</br>

    Admins can manage all memberships. Collaborators can manage memberships within
    their projects. Viewers cannot manage memberships.
    """

    class Role(models.TextChoices):
        COLLABORATOR = "collaborator", "Collaborator"
        VIEWER = "viewer", "Viewer"

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="memberships")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="memberships")
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.VIEWER)
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("project", "user")
        indexes = [
            models.Index(fields=["project", "user"]),
        ]

    def __str__(self) -> str:
        return f"{self.user} -> {self.project} as {self.role}"

