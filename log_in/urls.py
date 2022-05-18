from django.urls import path
from . import views

urlpatterns = [
        path('home', views.index, name='landing'),
        #i wonder if we have some flexibility in changing the 
        #url pattern below 'accounts/login/' to something different
        #and also if we extend/inherit from 'LoginView' if the named url
        #'login' still works. we should try both concerns
        path('login/', views.CustomLogin.as_view(), name='mylogin'),
        #so we still need to call ".as_view()" method on our custom
        #LoginView class based view which makes sense. i just thought
        #if we were specifying the template in the class that we 
        #didn't need to call ".as_view()" as i thought we only call
        #that when we want to pass in "template_name".

        #looks like the 'login' url name wasn't found in our template, so 
        #i think by inheriting/extending 'LoginView' we lose that named url.
        #lol, i guess we can easily resolve that by setting "name='login'"
        #path('registration/', views.signup, name='signup'),
        path('registration/', views.SignUpView.as_view(), name='signup'),
        path('profile/', views.profile, name='account'),
        path('profile/details/<str:group>', views.details, name='profile-details'),
        path('profile/tutor/availability/', views.availability, name='availability'),
        path('profile/edit/school/', views.editSchoolView, name='edit-school'),
        path('profile/edit/major/<int:pk>', views.editMajor, name='edit-major'),
        path('profile/edit/course/<int:course_map_id>', views.editCourse, name='edit-course'),
        path('profile/delete/major/<int:pk>', views.deleteMajor, name='delete-major'),
        path('profile/add/major/<int:user_id>/', views.addMajor, name='add_major'),
        path('profile/add/course/<int:user_id>/', views.addCourse, name='add_course'),
        path('profile/delete/course/<int:user_course_id>/', views.deleteCourse, name='delete-course'),
        path('profile/save/<str:fieldName>/', views.saveChanges, name='save-edit'),
        path('profile/delete/<str:fieldName>/', views.deleteField, name='remove-field'),
        path('profile/search/course/', views.searchCourse, name='search_course'),
        path('profile/tutors/', views.queryTutorsView, name='query-tutors'),
        path('profile/tutors/<int:school_id>', views.findTutorBySchool, name='tutor-school'),
        path('profile/tutors/course/', views.findTutorByCourse, name='tutor-course'),
        path('profile/tutors/overview/<int:user_id>/<int:course_id>/', views.tutorOverview, name='view-tutor-profile'),
        path('profile/edit/about/<int:user_id>/', views.editAbout, name='edit-about'),
        path('reserve/<int:user_id>/<int:tutor_id>/<int:course_id>/', views.requestAppt, name='request-appt'),
        path('approve/request/', views.approve_request, name='approve-request'),
        path('deny/request/', views.deny_request, name='deny-request'),
        path('set/group/', views.setGroup, name='setgroup'),
        ]
