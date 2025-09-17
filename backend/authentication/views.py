from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import JSONParser, FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegisterSerializer, UserSerializer


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
@parser_classes([JSONParser, FormParser, MultiPartParser])
def register_view(request):
    """Register a new user (default role: viewer).

    Validates input data with password validation and creates a user.
    """

    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        # Return structured validation errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = serializer.save()

    # Optionally issue JWT tokens on registration to streamline UX
    refresh = RefreshToken.for_user(user)
    payload = {
        "user": UserSerializer(user).data,
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }
    return Response(payload, status=status.HTTP_201_CREATED)


class MeView(APIView):
    """Return the current authenticated user's profile information."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class LogoutView(APIView):
    """Blacklist the provided refresh token to log the user out securely."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh = request.data.get("refresh")
        if not refresh:
            return Response({"detail": "refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(refresh)
            token.blacklist()
        except Exception:
            return Response({"detail": "Invalid refresh token"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "Logged out"}, status=status.HTTP_200_OK)

