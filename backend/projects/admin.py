from django.contrib import admin

from .models import Project, ProjectMembership


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("name", "status", "start_date", "end_date", "created_by", "created_at")
    list_filter = ("status", "start_date", "end_date", "created_at")
    search_fields = ("name", "description")
    autocomplete_fields = ("created_by",)


@admin.register(ProjectMembership)
class ProjectMembershipAdmin(admin.ModelAdmin):
    list_display = ("project", "user", "role", "assigned_at")
    list_filter = ("role", "assigned_at")
    search_fields = ("project__name", "user__username", "user__email")
    autocomplete_fields = ("project", "user")


# Register your models here.
