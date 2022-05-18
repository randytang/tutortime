"""project URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from api import views
from rest_framework.authtoken import views as tokenviews

router = routers.DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'groups', views.GroupViewSet)
#router.register(r'school', views.SchoolViewSet)
router.register(r'users-majors', views.UserMajorViewSet)
router.register(r'majors', views.MajorViewSet)
router.register(r'courses', views.CourseViewSet)
router.register(r'users-courses', views.UserCoursesViewSet),
router.register(r'appt-details', views.ApptDetailsViewSet),
router.register(r'appt-requests', views.ApptRequestsViewSet),
router.register(r'tutor-profile', views.TutorProfileViewSet),

urlpatterns = [
    path('admin/', admin.site.urls),
    path('app/', include('log_in.urls')),
    #test if paths are significant by order. i would like to be consistent
    #and have a view fall under 'rest/' url pattern but its not a ViewSet
    #but rather a regular function view so will try to append it before 
    #below path and see if it doesn't negatively affect it.
    #path('rest/users-school-majors/<int:pk>/', views.SchoolMajorsView),
    path('rest/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
#    path('get-a-token/', tokenviews.obtain_auth_token),
    path('testfront/', include('testfront.urls')),
    path('get-a-token/', views.CustomAuthToken.as_view()),
#    path('profile/users-school-majors/<int:pk>/', views.SchoolMajorsView),
    path('profile/users-basic/<int:pk>/', views.flattenedBasicUserView),
    path('profile/users-courses/', views.flattenedUserCoursesView),
    path('profile/users-appts/', views.flattenedApptRequestsView),
    path('profile/school-majors/<int:pk>/', views.flattenedSchoolMajorsView.as_view()),
    path('signup/', views.CreateUserView.as_view()),
    path('school/<str:uinput>/', views.SchoolView.as_view()),
    path('profile/users-groups/<int:pk>/', views.UserGroup.as_view()),
    path('users/request-appt/', views.RequestAppt.as_view()),
    path('list/tutors/course/<int:pk>/', views.TutorsFoundByCourse.as_view()),
    path('list/school/courses/', views.SchoolCourses.as_view()),
    path('appts/approve/<int:pk>/', views.ApproveRequest.as_view()),
    path('appts/deny/<int:pk>/', views.DenyRequest.as_view()),
    path('search/courses/', views.SearchCourses.as_view()),
    path('profile/users-appts-ordered/', views.OrderedApptRequestsView),
    path('profile/add/course/', views.AddCourse.as_view()),
    path('accounts/', include('django.contrib.auth.urls')),
    path('profile/update/', views.UpdateUserBasic.as_view()),
]
