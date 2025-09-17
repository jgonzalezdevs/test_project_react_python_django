from django.contrib import admin

from .models import Comment, Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("name", "project", "status", "assignee", "due_date", "created_by", "created_at")
    list_filter = ("status", "due_date", "created_at")
    search_fields = ("name", "description")
    autocomplete_fields = ("project", "assignee", "created_by")


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("task", "author", "created_at")
    list_filter = ("created_at",)
    search_fields = ("content", "task__name", "author__username")
    autocomplete_fields = ("task", "author")


# Register your models here.
