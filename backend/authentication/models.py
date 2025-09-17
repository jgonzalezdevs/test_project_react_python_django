from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """Custom user model with roles.

    Roles control access to modules and permissions across the system.
    - admin: Full access; can manage users, projects, tasks, and assignments.
    - collaborator: Can create/edit projects and tasks and manage assignments within their projects.
    - viewer: Read-only access to data they are assigned to (limited in API by permissions).
    """

    class Roles(models.TextChoices):
        ADMIN = "admin", "Admin"
        COLLABORATOR = "collaborator", "Collaborator"
        VIEWER = "viewer", "Viewer"

    role = models.CharField(
        max_length=20,
        choices=Roles.choices,
        default=Roles.VIEWER,
        help_text="Role that defines access level for the user.",
    )

    def __str__(self) -> str:
        # Display username and role for clarity in admin and logs
        return f"{self.username} ({self.role})"

