from rest_framework import permissions

class IsUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return True
    def has_object_permission(self, request, view, obj):
        return obj == request.user
        

