from django.shortcuts import render

from django.contrib.auth.views import LoginView
from django.core.exceptions import ObjectDoesNotExist
#from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import Group
from django.contrib.auth.decorators import login_required
from django.db import Error as dbError
from django.urls import reverse, reverse_lazy
from django.http import HttpResponseRedirect
from django.contrib import messages
from django.db.models import Q
from .forms import CustomUserCreationForm
from .models import CustomUser, UserMajorMap, School, Major, UserCoursesMap, Course, TutorProfile, ApptDetails, ApptRequests
from django.contrib.auth import get_user_model
from django.views.generic.edit import CreateView
from django.contrib.messages.views import SuccessMessageMixin

from datetime import date
import datetime
import re
import pytz

# Create your views here.

#helper function to determine which semester we're in
#0 will be spring, 1 will be summer session, 2 will be fall,
#depending on the school, 3 will be winter
#below are RIC's calendar dates, will change according to school
SPRING_START = date(date.today().year, 1, 18)
SPRING_END =date(date.today().year, 5, 10)
SUMMER_START = date(date.today().year, 5, 16)
SUMMER_END = date(date.today().year, 8, 5)
FALL_START = date(date.today().year, 8, 19) 
FALL_END = date(date.today().year, 12, 23)

def whichSemester(aDate):
    if aDate > SPRING_START and aDate < SPRING_END:
        return 0
    elif aDate > SUMMER_START and aDate < SUMMER_END:
        return 1
    elif aDate > FALL_START and aDate < FALL_END:
        return 2

#how many times does 'whichSemester' get called? if we're only 
#calculating the current semester whenever the server starts, 
#we may be assigning incorrect value as current semester. maybe have
#a script/running task that calls 'whichSemester' every day?
CURRENT_SEMESTER = whichSemester(date.today())


def setGroup(request):
    group_to_set = request.POST['group']
    group_to_assign = Group.objects.get(name=group_to_set)
    request.user.groups.add(group_to_assign)
    messages.add_message(request, messages.SUCCESS, "Successfully set type of account.")
    return HttpResponseRedirect(reverse('account'))

def index(request):
    #this should be the landing page for both tutors and students and
    #provide a link to login
    context = {}
    return render(request, "log_in/index.html", context)

def profile(request):
    context = {}
    try:
#        groupName = request.user.groups.get().name
        group_set = request.user.groups.exists()
    except ObjectDoesNotExist as groupNotSetYet:
        #this exception means user has not yet set the group as 'tutor' or 'student' which makes sense
        #as we no longer have that input for the user to choose upon sign up.
        #messages.add_message(request, messages.ERROR, 'Please remember to navigate to your "Profile" settings page to set your group.')
        messages.add_message(request, messages.ERROR, 'You have to set above which type of account this is before using this app any further.', extra_tags='NOACCOUNTTYPE_ERROR')
        return render(request, "log_in/base_profile_refac.html", context)

#    if (groupName == "tutors"):
#        context['isTutor'] = True
#        context['isStudent'] = False
#    elif (groupName == "students"):
#        context['isStudent'] = True
#        context['isTutor'] = False
#    else:
#        context['isTutor'] = False
#        context['isStudent'] = False
#        context['error'] = "Sorry, user is not in any designated groups."

    if (request.user.groups.values().filter(name__icontains="tutor").exists()):
        context['isTutor'] = True
    else:
        context['isTutor'] = False

    if (request.user.groups.values().filter(name__icontains="student").exists()):
        context['isStudent'] = True
    else:
        context['isStudent'] = False

#    if context['isTutor']:
#        all_requests = ApptRequests.objects.filter(tutor_requested_id = request.user.id)
#    elif context['isStudent']:
#        all_requests = ApptRequests.objects.filter(student_id = request.user.id)
#
    all_requests = ApptRequests.objects.filter(Q(student_id = request.user.id) | Q(tutor_requested_id = request.user.id))


    if all_requests:
        approved_appts = all_requests.filter(approval = 1)
        context['requests'] = all_requests
        context['approved_appts'] = approved_appts

    return render(request, "log_in/base_profile_refac.html", context)

#    try:
#        tutorUser = request.user.groups.get(name="tutors")
#        context['group'] = "TUTOR"
#        return render(request, "log_in/base_profile_tutor.html", context)
#    except ObjectDoesNotExist:
#        pass
#
#    try:
#        studentUser = request.user.groups.get(name="students")
#        context['group'] = "STUDENTS"
#        return render(request, "log_in/base_profile_student.html", context)
#    except ObjectDoesNotExist:
#        pass
#
#    if context['group']:
#        #if 'group' has value, maybe that means we can just use
#        #request.user directly in template without passing it in context
#        #variable i.e context['theUser'] = request.user
#
#        #not sure if we should return/render 2 separate templates,
#        #one for tutors and one for students or if we should just
#        #have a base template and render accordingly?
#        #return render(request, "log_in/profile.html", context)
#        #going to attempt to use inherited templates for first time
#
#    else:
#        context['error'] += "Sorry, user not in any designated groups."
#        return render(request, "log_in/profile.html", context)

#    context['error'] += "Sorry, user not in any designated groups."
#    return render(request, "log_in/profile.html", context)

#because we've implemented a class based view to handle user 
#registration, we should deprecate/remove below 'signup' function based view.
def signup(request):
    context = {}
    context['form_error'] = False
    if request.method == 'GET':
        #we may not be able to use built in auth form for user creation
        #and may have to use our own because the built in just asks
        #for username, password1 and password2. we want to have student select
        #major. actually, its probably best to just be able to create 
        #a user first and then depending on the user, allow them to set
        #further fields i.e major, rate, depending on what they signed up as.
        #actually, let me try to see if we can cherry pick what fields/labels
        #we want from a built in form. we may not need the whole form.
        #form = UserCreationForm()
        form = CustomUserCreationForm()
        context['form'] = form
    elif request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            #lol, so we keep getting an AttributeError after hitting
            #submit button on user creation page/view and I think its
            #because when we call "is_valid()", we're calling the 
            #that method that belong's to "UserCreationForm" which is
            #a built in django form used for django's auth user.  but
            #we inherited/extended that user so we must create our 
            #own modelForm class extending/inheriting 'UserCreationForm'.

            #shortly after coming to that hypothesis, i recall when 
            #creating a modelForm from a specific model, you have to specify
            #which model. so we should be pointing to our extended model
            #CustomUser instead.
            #todo - validate each field, or do it via js/html
            uname = request.POST['username']
            pword = request.POST['password2']
            hashed_pword = make_password(pword)
            user_type = request.POST['usertype']
            group_to_assign = Group.objects.get(name=user_type)
            #new_user = CustomUser.objects.create_user(uname, password=hashed_pword)
            new_user = get_user_model().objects.create_user(uname, password=hashed_pword)
            #lol, i attempted to wrap above line in a try/except block
            #but i couldn't determine appropriate exception to use
            #i tried erroneously calling "create_user()" in django's 
            #shell to see what exceptions would be thrown lol but
            #the method is so liberal/forgiving, all you need is a username.

            new_user.groups.add(group_to_assign)
            context['success'] = "New user created. Click link to login page to sign in."
            return render(request, "log_in/signup_result.html", context)
        else:
            context['form'] = form
            #above line should be passing form that was filled out
            #incorrectly back to template. what we want specifically is
            #any error messages about which fields
            form_error = True
            context['form_error'] = form_error
    return render(request, "log_in/signup_form.html", context)

class SignUpView(SuccessMessageMixin, CreateView):
    form_class = CustomUserCreationForm
    success_url = reverse_lazy('mylogin')
    success_message = "User created succesfully. You can now try logging in."
    template_name = 'log_in/signup_form.html'

#helper function for 'details' view
def isOlderCourse(acourse):
    if acourse.year_taken < date.today().year or acourse.semester < CURRENT_SEMESTER:
        return True
    else:
        return False

#@login_required
#so, navigating to this view from view that is a redirect after authenticating
#user didn't throw any errors regarding permissions/errors. So i guess
#user identity is persisted perhaps in django's built in session mechanism.
#but i suspect if we try to navigate to this view directly url pattern
#before loggin in will throw a permissions error. to test later on.
#so, i cleared the cache before navigating to this view and it allowed
#us to view it. So we'll have to see if annotating with login_required decorator
#will fix that.
def details(request, group):
    #i wonder if the authenticated user is accessible in the template
    #as they are in the profile via "request" object. we'll test 
    #this out
    context = {}
    
#    groupName = request.user.groups.get().name
#    if (groupName == "tutors"):
#        context['isTutor'] = True
#        context['isStudent'] = False
#    elif (groupName == "students"):
#        context['isStudent'] = True
#        context['isTutor'] = False
    if (request.user.groups.values().filter(name__icontains="tutor").exists()):
        context['isTutor'] = True
    else:
        context['isTutor'] = False

    if (request.user.groups.values().filter(name__icontains="stduent").exists()):
        context['isStudent'] = True
    else:
        context['isStudent'] = False


    context['list_of_majors'] = UserMajorMap.objects.filter(user_id=request.user.id)
    if request.user.school_id:
        schoolName = request.user.school.name
        sizeAttribute = len(schoolName) 
        context['size'] = sizeAttribute
    context['group'] = group
    allUsersCourses = UserCoursesMap.objects.filter(user_id=request.user.id)
    if group == "tutor":
        context['isTutor'] = True
        context['isStudent'] = False
        #we're going to use python's filter function to get
        #old courses. the filter function will create a list
        #for which a helper function returns true if course
        #is an old course
        oldCourses = list(filter(isOlderCourse, allUsersCourses))
        context['course_history'] = oldCourses
        context['current_courses'] = list(filter(lambda x: not isOlderCourse(x), allUsersCourses))
        #this python lambda feature is pretty cool in how i can just
        #negate the filter's function and not have to modify the 
        #filter function's code/logic.
        #if user is tutor, we should pass in existing, if any, instance/record in "TutorProfile".
        try:
            context['tutor_profile_record'] = TutorProfile.objects.get(user_id=request.user.id)
        except ObjectDoesNotExist:
            context['tutor_profile_record'] = False
    elif group == "student":
        context['current_courses'] = list(filter(lambda x: not isOlderCourse(x), allUsersCourses))
    return render(request, "log_in/profile-details.html", context)




class CustomLogin(LoginView):
    template_name = "log_in/login.html"
    next_page = "/app/profile/"


def availability(request):
    context = {}
    return render(request, 'log_in/availability.html', context)

#TODO, generify this view for all editable fields by checking 
#which field is to be edited, then assign/pass in appropriate values
#accordingly to context variables so templates are rendered correctly

def editSchoolView(request):
    context = {}

    groupName = request.user.groups.get().name
    if (groupName == "tutors"):
        context['isTutor'] = True
        context['isStudent'] = False
    elif (groupName == "students"):
        context['isStudent'] = True
        context['isTutor'] = False
    else:
        context['isTutor'] = False
        context['isStudent'] = False
        context['error'] = "Sorry, user is not in any designated groups."

    #when we generify this view function, we'll test which field is being
    #edited, then have some sort of dictionary that maps the appropriate
    #values and then use that dictionary to assign values to below
    #context variables.
    context['list_of_majors'] = UserMajorMap.objects.filter(user_id=request.user.id)
    #context['list_of_schools'] = School.objects.all()
    #renamed above context variable to below to be more generic.
    context['options_for_datalist'] = School.objects.all()
    #below context variable is to signify that the template should
    #specify a 'list' attribute for the input element so that the different
    #options can be rendered for the input field. We need this variable
    #because an input field may take user input for a model/table field
    #that isn't a foreign key of existing values/records i.e schools, courses
    #vs email, last name.
    context['isMultipleValue'] = True
    context['listAttributeName'] = "schools"
    context['idOfInput'] = "school-name"
    context['nameOfInput'] = "school"
    #we'll use the below context variable as value for 'placeholder' attribute
    #this will help user see what value they may be editing/deleting.
    #we also have to test if there's actually an existing value because
    #we want to make sure we render from templates appropriately if there
    #are no existing value(s) in that field. question is, do we test in 
    #views or in templates? if the database has "NULL" as a value,
    #how does python treat that? and how does django's template system
    #treat "NULL"?
    if request.user.school_id:
        schoolName = request.user.school.name
        sizeAttribute = len(schoolName) 
        context['existingValue'] = schoolName
        context['size'] = sizeAttribute
    else:
        context['existingValue'] = ""
    return render(request, 'log_in/edit-school.html', context)

def editMajor(request, pk):
    if request.method == 'GET':
        context = {}

        groupName = request.user.groups.get().name
        if (groupName == "tutors"):
            context['isTutor'] = True
            context['isStudent'] = False
        elif (groupName == "students"):
            context['isStudent'] = True
            context['isTutor'] = False
        else:
            context['isTutor'] = False
            context['isStudent'] = False
            context['error'] = "Sorry, user is not in any designated groups."

        context['list_of_majors'] = UserMajorMap.objects.filter(user_id=request.user.id)
        context['isMultipleValue'] = True
        context['listAttributeName'] = "majors"
        context['classOfInput'] = "major"
        context['nameOfInput'] = "major"
        context['options_for_datalist'] = Major.objects.filter(school_id=request.user.school_id)
        context['pk'] = pk
        #unlike with the user's school field, there shouldn't be an empty
        #or null/blank value for the school field because we're only
        #deleting the entire row instead of just nullifying the field.
        #so because there shouldn't be an empty field, we don't need
        #to test for an existing value but rather just grab the existing
        #value using the primary key provided from the request.
        oldMajor = UserMajorMap.objects.get(id=pk).major.major

        context['existingValue'] = oldMajor
        context['size'] = len(oldMajor)
        return render(request, 'log_in/edit-major.html', context)
    elif request.method == 'POST':
        context = {}
        context['error'] = ""
        context['success'] = ""
        try:
            majorEntered = request.POST['major']
            schoolsMajorsQS = Major.objects.filter(school_id=request.user.school_id)
            majorMatches = schoolsMajorsQS.filter(major__icontains=majorEntered)
            if majorMatches.count() > 1:
                context['error'] += "Sorry, more than 1 majors resulted in that entry. Please be more exact in spelling the major."
            elif majorMatches.count() == 1:
                newMajor = majorMatches.first()
                oldMajorRow = UserMajorMap.objects.get(id=pk)
                oldMajorRow.major = newMajor
                try:
                    oldMajorRow.save()
                    context['success'] += "Successfully updated records for user's major(s)."
                    #we also have to assign queryset of user's majors back into
                    #'list_of_majors' context variable because when we save changes
                    #to a user's major, it will only return 'success' message
                    #without showing/reflecting update by listing student's 
                    #majors. we assign this context variable above in "GET"
                    #branch but we also want to do it after a successful "POST"
                    #branch.
                    context['list_of_majors'] = UserMajorMap.objects.filter(user_id=request.user.id)
                except dbError:
                    context['error'] += "Sorry, couldn't save new major for some reason. Check logs"
        except KeyError as noMajorEntered:
            pass
    return render(request, 'log_in/profile-details.html', context)

def deleteMajor(request, pk):
    context = {}
    context['error'] = ""
    context['success'] = ""
    major_to_delete = UserMajorMap.objects.get(id=pk)
    try:
        major_to_delete.delete()
        context['success'] += "Successfully deleted user's major from profile."
        context['list_of_majors'] = UserMajorMap.objects.filter(user_id=request.user.id)
    except dbError:
        context['error'] += "Sorry, couldn't delete major from profile for some reason. Check logs."
    return render(request, 'log_in/profile-details.html', context)

def addMajor(request, user_id):
    #going to get in habit of passing in user's ID argument to view functions
    #because i suspect we'll be using this pattern for the restful API 
    #version rather than continuing to rely on 'request.user'
    context = {}

    groupName = request.user.groups.get().name
    if (groupName == "tutors"):
        context['isTutor'] = True
        context['isStudent'] = False
    elif (groupName == "students"):
        context['isStudent'] = True
        context['isTutor'] = False

    
    context['user_id'] = user_id
    #below context variable assignment is outside if/else branch
    #because we'll need it for both
    majorsOfferedQS = Major.objects.filter(school_id = request.user.school_id)
    if request.method == "GET":
        context['majorsOffered'] = majorsOfferedQS
        #dont forget to pass in 'user_id' to context variable
        #and we'll need similar context variables we used in editing
        #existing major so we just copy some logic/code from above
        #view for editing a major. only difference is, we're not
        #populating a 'placeholder' thus no need for 'size' context variable
        context['isMultipleValue'] = True
        #reminder that above context variable 'isMultipleValue' is 
        #needed because if multiple values/choices to choose from then
        #we set 'list' attribute in template if 'isMultiplevalue' is True.
        context['listAttributeName'] = "majors"
        context['classOfInput'] = "major"
        context['nameOfInput'] = "major"
        context['options_for_datalist'] = majorsOfferedQS
        return render(request, 'log_in/add-major.html', context)
    elif request.method == "POST":
        context['error'] = ""
        context['success'] = ""
        try:
            majorEntered = request.POST['major']
            majorMatches = majorsOfferedQS.filter(major__icontains=majorEntered)
            if majorMatches.count() > 1:
                context['error'] += "Sorry, more than 1 result matched that entry. Please be more exact in spelling of major."
            elif majorMatches.count() == 1:
                newMajorID = majorMatches.first().id
                newUserMajorMap = UserMajorMap(major_id=newMajorID, user_id=user_id)
                try:
                    newUserMajorMap.save()
                    context['success'] += "Successfully added a new major/minor."
                    messages.add_message(request, messages.SUCCESS, 'Added a new major/minor.')
                except dbError:
                    context['error'] += "Sorry, couldn't add new major/minor for some reason. Check logs."
            else:
                context['error'] += "Sorry, no majors were found with that entry. Please be more specific."
            
        except KeyError as noMajorEntered:
            context['error'] += "Sorry, user did not enter any value(s) in input."
        #it seems we have to remember to pass in list of user's current
        #majors after a successful post/change which seems redundant
        #but a potential solution/alternative would be to call
        #'reverse' to 'profile-details' view but then we wouldn't be able
        #to pass in 'success' context variable or 'error' as well.
        context['list_of_majors'] = UserMajorMap.objects.filter(user_id=user_id)
        #return render(request, 'log_in/profile-details.html', context)
        #return HttpResponseRedirect("/app/profile/details")
        #lol, because we changed url pattern above to 'app/profile/details/<str:group>' we now have broken 'HttpResponseRedirect' call above. So 
        #now we're going to resort to using 'reverse' instead, so we
        #have to get the user's group to pass as a keyword arg to 'reverse'

        groupName = request.user.groups.get().name
        #lol, this is bad design. we should be consistent and just use
        #"tutors" instead of both "tutors" and "tutor"
        if groupName == "tutors":
            group = "tutor"
        else:
            group = "student"
        return HttpResponseRedirect(reverse('profile-details', kwargs={'group': group}))


def saveChanges(request, fieldName):
    context = {}
    context['error'] = ""
    if fieldName == 'school':
        #remember to set context variables to provide existing user data/values
        #to render alongside changed/edited field, i.e 'major' fields if
        #user updated 'school' field.
        context['list_of_majors'] = UserMajorMap.objects.filter(user_id=request.user.id)
        try:
            schoolEntered = request.POST['school']
            schoolMatch = School.objects.filter(name=schoolEntered)
            if schoolMatch.count() > 1:
                context['error'] = "Sorry, more than 1 school resulted in that entry. Please be more exact in spelling name of school."
            elif schoolMatch.count() == 1:
                schoolID = schoolMatch.first().id
                request.user.school_id = schoolID
                request.user.save()
                context['success'] = "Successfully saved changes to user's school."
        except KeyError as emptyInput:
            #if user didn't type anything into 'school' field,
            #they either don't want to change the current school
            #or mistakenly clicked 'save' icon/button. In either case
            #we're going to keep current school in database/table.
            #TODO: implement some logging in this 'except' clause to 
            #document/log user didn't input anything
            pass
    #TODO: more elif branches to handle other field names i.e 'major',
    #'course', 'email', etc.

    return render(request, 'log_in/profile-details.html', context)

def deleteField(request, fieldName):
    #a problem i discovered is if the field is a foreign key, we wont
    #be removing the record but rather nullifying the field or making it
    #empty but if the field holds a value that should be removed along with 
    #the entire record then we cant just nullify the field but 
    #make sure django's db api issue sql to delete the row/record i.e a user
    #may have multiple majors/courses and to delete one of them, we'd have to
    #remove a record from their respective user-course or user-major tables as
    #opposed to the user's school field where there isn't a user-school table.
    #perhaps this is where a nosql database would be a better fit/solution.
    context = {}

    groupName = request.user.groups.get().name
    if (groupName == "tutors"):
        context['isTutor'] = True
        context['isStudent'] = False
    elif (groupName == "students"):
        context['isStudent'] = True
        context['isTutor'] = False


    context['error'] = ""
    context['success'] = ""
    if fieldName == 'school':
        #i forget if we check for non empty/non null fields in profile details view.
        #request.user.school_id = ""
        #we keep getting 'error during template rendering' after attempting
        #to remove/delete the 'school' field so i think the issue may be
        #that we're assigning an empty string into a field, 'school_id', that
        #takes numbers/int so we're going to try assigning 'None' to signify
        #no value in the field.
        request.user.school_id = None
        #yup, using 'None' instead of an empty string worked. 
        try:
            request.user.save()
            context['success'] += "Successfully, deleted/removed existing value for user's school."
        #lol, i forget whats the base exception class to capture any possible
        #django exception, specifically exceptions relating to django models
        except dbError:
            context['error'] += "Sorry, couldn't save changes to field for some reason."
    return render(request, 'log_in/profile-details.html', context)
    #return HttpResponseRedirect(reverse('profile-details'))


        
#TODO: delete below view if no breaking changes. Don't see any use of 'edit-course' template
def editCourse(request, course_map_id):
    context = {}
    return render(request, 'log_in/edit-course.html', context)


def addCourse(request, user_id):
    context = {}
    context['add_course_error'] = ""
    context['add_course_success'] = ""
    groupName = request.user.groups.get().name
    allUsersCourses = UserCoursesMap.objects.filter(user_id=request.user.id)
    if (groupName == "tutors"):
        context['isTutor'] = True
        context['isStudent'] = False
        context['group'] = 'tutor'
        oldCourses = list(filter(isOlderCourse, allUsersCourses))
        context['course_history'] = oldCourses
    elif (groupName == "students"):
        context['isStudent'] = True
        context['isTutor'] = False
        context['group'] = 'student'
    else:
        context['isTutor'] = False
        context['isStudent'] = False
        context['error'] = "Sorry, user is not in any designated groups."
    if request.method == "GET":
        context['list_of_majors'] = UserMajorMap.objects.filter(user_id=request.user.id)
        if request.user.school_id:
            schoolName = request.user.school.name
            sizeAttribute = len(schoolName) 
            context['size'] = sizeAttribute

        context['current_courses'] = list(filter(lambda x: not isOlderCourse(x), allUsersCourses))
        return render(request, 'log_in/add-course.html', context)
    elif request.method == "POST":
        course_choice = int(request.POST['course'])
        semester = int(request.POST['semester'])
        user_course_map = UserCoursesMap(taking_course_id = course_choice, user_id = user_id, semester = semester)
        try:
            user_course_map.save()
            context['add_course_success'] = "Successfully added new course to user's profile."
            messages.add_message(request, messages.SUCCESS, "Successfully added new course to user's profile.")
        except dbError:
            #context['add_course_error'] = "Sorry, couldn't save that course to user's profile."
            messages.add_message(request, messages.ERROR, "Sorry, couldn't save that course to user's profile.")
            #i realized we may not be able to utilize django's messages framework as we use the 'messages' context variable in a few other blocks of the same template so the error/success messages intended for one section i.e majors/courses, may be rendered in another's section/article. So we're going
            #to use more specific context variables for error and success.
    #lol, i always forget that when we use 'HttpResponseRedirect' or more
    #specifically the 'reverse' function, we can't pass template context
    #variables. So the 'success' or 'error' messages don't get passed.
    return HttpResponseRedirect(reverse('profile-details', kwargs={'group': context['group']}))




def searchCourse(request):
    context = {}
        

    #we need to search only the courses offered by the user's school, not all courses offered by all schools. performance is negligible 
    #at this scale but may help if we scale up to thousands of courses for hundreds of schools. so we first get a queryset of all the courses
    #offered at the user's school only.
    coursesOffered = Course.objects.filter(school_offering_id__exact=request.user.school_id)
    uInput = request.POST['qinput']
    course_code_pattern = re.compile(r"[a-zA-Z]{2,4} [0-9]{3-4}")
    #course_name_pattern = re.compile(r"[a-zA-Z/]+\s?[a-zA-Z]*[1-9]*")
    course_name_pattern = re.compile(r"[a-zA-Z/](\s?[a-zA-Z]*[1-9]*)*")
    course_code_match = course_code_pattern.fullmatch(uInput)
    course_name_match = course_name_pattern.fullmatch(uInput)
    if course_code_match:
        #records = coursesOffered.filter(Q(course_code__icontains=course_code_match.group(0)))
        records = coursesOffered.filter(course_code__icontains=course_code_match.group(0))
    elif course_name_match:
        records = coursesOffered.filter(name__icontains=course_name_match.group(0))
    else:
        messages.add_message(request, messages.ERROR, 'Sorry, no courses were found with that course code or name. Please be more exact.')
        return render(request, 'log_in/add-course.html', context)
    
    context['results'] = records

    #have to duplicate all the state/data for profile-details view just
    #like in addCourse view by adding below these comments.
    context['list_of_majors'] = UserMajorMap.objects.filter(user_id=request.user.id)
    allUsersCourses = UserCoursesMap.objects.filter(user_id=request.user.id)
    if request.user.school_id:
        schoolName = request.user.school.name
        sizeAttribute = len(schoolName) 
        context['size'] = sizeAttribute

    groupName = request.user.groups.get().name
    if (groupName == "tutors"):
        context['isTutor'] = True
        context['isStudent'] = False
        context['group'] = 'tutor'
        oldCourses = list(filter(isOlderCourse, allUsersCourses))
        context['course_history'] = oldCourses
    elif (groupName == "students"):
        context['isStudent'] = True
        context['isTutor'] = False
    else:
        context['isTutor'] = False
        context['isStudent'] = False
        context['error'] = "Sorry, user is not in any designated groups."
    context['current_courses'] = list(filter(lambda x: not isOlderCourse(x), allUsersCourses))
    #end section. above code before comment section is just duplicated
    #calls to gather state/data needed for details view again.
    #return render(request, 'log_in/add-course.html', context)
    #lol, we were returning a render of 'add-course.html' which 
    #doesn't override the 'search_results' block so that's probably
    #why we weren't getting an changes after submitting any input
    #in course search field.

    #if ("details" in request.path):
    #if ("details" in request.META['HTTP_REFERER']):
    #i thought above line was checking if we were coming from 'profile/details/<str:group>/' view
    #but we're actually coming from 'profile/add/course/<int:user_id>/'. 

    try:
        context['route0'] = request.POST['from']
    except KeyError:
        #if falling through, it means we're first using 'search' course functionality for first time
        #from either 'adding course' view or 'querying tutors' view. after this we should set 'route0' 
        #to persist so we know which view to stay on.
        pass
    if ("add" in request.META['HTTP_REFERER']) or ("add" in context['route0']):
        context['route0'] =  "add_course"
        return render(request, 'log_in/course-form.html', context)
    #the elif branch below checks if we're coming from 'querying tutors' page/view.
    elif ("tutors" in request.META['HTTP_REFERER']) or ("tutors" in context['route0']):
        context['route0'] = "query_tutors"
        return render(request, 'log_in/find-tutors.html', context)


def deleteCourse(request, user_course_id):
    groupName = request.user.groups.get().name
    if "tutor" in groupName:
        group = "tutor"
    else:
        group = "student"
    try:
        course_to_delete = UserCoursesMap.objects.get(id=user_course_id)
    except ObjectDoesNotExist:
        messages.add_message(request, messages.ERROR, "Error, unable to find that user-course map with that ID.")
    #i'd like to wrap the call to '.delete' in a try/catch block
    #but i dont know what most common exception may be thrown from calling 
    #it. i'd also like to use django's logging capabilities but 
    #need to figure out what exceptions to catch for first.
    try:
        course_to_delete.delete()
        messages.add_message(request, messages.SUCCESS, "Successfully removed course from user's profile.")
    except dbError:
        messages.add_message(request, messages.ERROR, "Sorry, couldn't delete course from profile for some reason.")
    return HttpResponseRedirect(reverse('profile-details', kwargs={'group': group}))

def queryTutorsView(request):
    context = {}

    groupName = request.user.groups.get().name
    if (groupName == "tutors"):
        context['isTutor'] = True
        context['isStudent'] = False
    elif (groupName == "students"):
        context['isStudent'] = True
        context['isTutor'] = False


    return render(request, 'log_in/find-tutors.html', context)

def findTutorBySchool(request, school_id):
    context = {}
    return render(request, 'log_in/find-tutors.html', context)

def findTutorByCourse(request):
    context = {}
    
    groupName = request.user.groups.get().name
    if (groupName == "tutors"):
        context['isTutor'] = True
        context['isStudent'] = False
    elif (groupName == "students"):
        context['isStudent'] = True
        context['isTutor'] = False

    course_id = request.POST['course']
    user_course_map_qs = UserCoursesMap.objects.filter(taking_course_id = course_id)
    context['resultsqs'] = user_course_map_qs
    context['course_id'] = course_id
    return render(request, 'log_in/find-tutors-list.html', context)
        
def tutorOverview(request, user_id, course_id):
    context = {}
    
    groupName = request.user.groups.get().name
    if (groupName == "tutors"):
        context['isTutor'] = True
        context['isStudent'] = False
    elif (groupName == "students"):
        context['isStudent'] = True
        context['isTutor'] = False


    #probably have to duplicate below line from 'findTUtorByCourse' view above because
    #'find-tutors-overview' template extends 'find-tutors-list' template which uses this context variable.
    context['course_id'] = course_id
    user_course_map_qs = UserCoursesMap.objects.filter(taking_course_id = course_id)
    context['resultsqs'] = user_course_map_qs
    getTutor = TutorProfile.objects.get(user_id = user_id)
    context['tutor'] = getTutor
    return render(request, 'log_in/find-tutors-overview.html', context)


#view for handling when user edits their 'about' message/section
def editAbout(request, user_id):
    context = {}
    #do we really need to pass this below context variable? seems redundant and easily accessible in all templates via 'user'?
    context['user_id'] = user_id

    context['list_of_majors'] = UserMajorMap.objects.filter(user_id=request.user.id)
    if request.user.school_id:
        schoolName = request.user.school.name
        sizeAttribute = len(schoolName) 
        context['size'] = sizeAttribute
    groupName = request.user.groups.get().name
    if "tutor" in groupName:
        context['group'] = "tutor"
        context['isTutor'] = True
        context['isStudent'] = False
        allUsersCourses = UserCoursesMap.objects.filter(user_id=request.user.id)
        oldCourses = list(filter(isOlderCourse, allUsersCourses))
        context['course_history'] = oldCourses
        context['current_courses'] = list(filter(lambda x: not isOlderCourse(x), allUsersCourses))
    else:
        context['group'] = "student"
        context['isTutor'] = False
        context['isStudent'] = True

    if request.method == "GET":
        #check to see if existing 'about' message in table
        try:
            tutor_profile_record = TutorProfile.objects.get(user_id = user_id)
            context['tutor_profile'] = tutor_profile_record
        except ObjectDoesNotExist:
            context['tutor_profile'] = False
        return render(request, 'log_in/edit-about.html', context)
    elif request.method == "POST":
        try:
            about_msg = request.POST['about-msg']
        except KeyError:
            messages.add_message(request, messages.ERROR, 'Sorry, nothing was entered in "About me" section.')
            return render(request, 'log_in/edit-about.html', context)

        #we should wrap this in try/catch block because its possible a record/instance in this table
        #model was never created considering the table/model only keeps track of a user's about message.
        try:
            tutor_profile = TutorProfile.objects.get(user_id = user_id)
            tutor_profile.about = about_msg
        except ObjectDoesNotExist:
            #lol, if it doesn't exist, either means we're trying to create a new record/instance
            #or we grabbed the wrong/non-existent 'user_id'. former is more likely so we'll continue creating a
            #record/instance
            tutor_profile = TutorProfile(user_id=user_id, about = about_msg)

        try:
            tutor_profile.save()
            messages.add_message(request, messages.SUCCESS, "Successfully saved changes to 'About me' section.")
        except dbError:
            messages.add_message(request, messages.ERROR, "Sorry, could not save changes to 'About me' section. Please try again.")
            return render(request, 'log_in/edit-about.html', context)
        return HttpResponseRedirect(reverse('profile-details', kwargs={'group': context['group']}))


def requestAppt(request, user_id, tutor_id, course_id):
    context = {}

    groupName = request.user.groups.get().name
    if (groupName == "tutors"):
        context['isTutor'] = True
        context['isStudent'] = False
    elif (groupName == "students"):
        context['isStudent'] = True
        context['isTutor'] = False


    #we put below lines outside of 'if' branch so we can allow these context variables to pass unto 'POST' branch in case
    #we need to re-render view back to user after an error/failure.
    context['course_id'] = course_id
    user_course_map_qs = UserCoursesMap.objects.filter(taking_course_id = course_id)
    context['resultsqs'] = user_course_map_qs
    context['user_id'] = user_id
    context['tutor_id'] = tutor_id
    #context['tutor'] = CustomUser.objects.get(id = tutor_id)
    context['tutor'] = TutorProfile.objects.get(user_id= tutor_id)
    if request.method == "GET":
        return render(request, 'log_in/tutor-appt-form.html', context)
    elif request.method == "POST":
        subject_ipt = request.POST['subject']
        date_ipt = request.POST['date']
        time_ipt = request.POST['time']
        location_ipt = request.POST['location']
        date1 = datetime.date.fromisoformat(date_ipt)
        time1 = datetime.time.fromisoformat(time_ipt)
        date_final = datetime.datetime(date1.year, date1.month, date1.day, time1.hour, time1.minute, tzinfo=pytz.UTC)
        appt = ApptDetails(subject=subject_ipt, date_and_time=date_final, location=location_ipt)
        #unsure if i should save the ApptDetails instance first before passing it as argument to instantiate ApptRequests instance
        try:
            appt.save()
        except dbError:
            messages.add_message(request, messages.ERROR, "Sorry. Couldn't save appointment details for some reason.")
            return render(request, 'log_in/tutor-appt-form.html', context)
        request1 = ApptRequests(student_id = user_id, tutor_requested_id = tutor_id, appt_details = appt)
        try:
            request1.save()
            messages.add_message(request, messages.SUCCESS, "Successfully submitted a request for a tutoring session. Navigate to 'Appointments' tab to view status of your requests/appointments.")
        except dbError:
            messages.add_message(request, messages.ERROR, "Sorry, couldn't create an appointment request for some reason. Please try again.")
            return render(request, 'log_in/tutor-appt-form.html', context)
        return HttpResponseRedirect(reverse('view-tutor-profile', kwargs={'user_id': tutor_id, 'course_id': course_id}))


def approve_request(request):
    request_id = request.POST['student_request']
    request_record = ApptRequests.objects.get(id=int(request_id))
    try: 
        notes_ipt = request.POST['notes-request']
        request_record.notes = notes_ipt
    except KeyError:
        pass
    request_record.pending = 0
    request_record.approval = 1
    try:
        request_record.save()
        messages.add_message(request, messages.SUCCESS, "Successfully approved student's request.")
        #TODO: auto notification via email/sms to student alerting status change to their request.
    except dbError:
        messages.add_message(request, messages.ERROR, "Sorry, couldn't approve student request for some reason. Please try again.")

    return HttpResponseRedirect(reverse('account'))

def deny_request(request):
    request_id = request.POST['student_request']
    request_record = ApptRequests.objects.get(id=int(request_id))
    try: 
        notes_ipt = request.POST['notes-request']
        request_record.notes = notes_ipt
    except KeyError:
        pass
    request_record.pending = 0
    request_record.approval = 0
    try:
        request_record.save()
        messages.add_message(request, messages.SUCCESS, "Successfully denied student's request.")
    except dbError:
        messages.add_message(request, messages.ERROR, "Sorry, couldn't deny student request for some reason. Please try again.")

    return HttpResponseRedirect(reverse('account'))
