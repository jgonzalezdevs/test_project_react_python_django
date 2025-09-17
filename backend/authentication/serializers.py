from typing import Any, Dict

from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializer for the custom User model.

    Exposes safe fields for the API.
    """

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "is_active",
            "date_joined",
        ]
        read_only_fields = ["id", "is_active", "date_joined", "role"]


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer used for user registration with password validation."""

    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "first_name", "last_name", "password", "password2"]

    def validate_username(self, value: str) -> str:
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters long.")
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate_email(self, value: str) -> str:
        # Email is optional, but if provided ensure uniqueness
        if value and User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        if attrs.get("password") != attrs.get("password2"):
            raise serializers.ValidationError({"password": "Passwords do not match."})
        # Run Django's password validators
        validate_password(attrs["password"])
        return attrs

    def create(self, validated_data: Dict[str, Any]) -> User:
        validated_data.pop("password2")
        password = validated_data.pop("password")
        # Default role for self-registration is viewer
        user: User = User(**validated_data)
        user.role = User.Roles.VIEWER
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer to validate the login payload."""

    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        user = authenticate(username=attrs.get("username"), password=attrs.get("password"))
        if not user:
            raise serializers.ValidationError("Invalid credentials.")
        if not user.is_active:
            raise serializers.ValidationError("Inactive user.")
        attrs["user"] = user
        return attrs
