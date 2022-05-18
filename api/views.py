from django.contrib.auth.models import Group
from log_in.models import CustomUser, School, UserMajorMap, Major, Course, UserCoursesMap, ApptDetails, ApptRequests, TutorProfile
from rest_framework import viewsets
from rest_framework import permissions
from .serializers import CustomUserSerializer, GroupSerializer, SchoolSerializer, UserMajorSerializer, MajorSerializer, CourseSerializer, UserCoursesSerializer, ApptDetailsSerializer, ApptRequestsSerializer, TutorProfileSerializer, flatBasicUserSerializer, BasicUserSerializer
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.decorators import api_view, action
from rest_framework.views import APIView
from django.core.exceptions import ObjectDoesNotExist, PermissionDenied
from django.http import Http404
from .permissions import IsUser
from rest_framework.generics import CreateAPIView
from django.contrib.auth import get_user_model
from rest_framework import status
import datetime
from django.db.models import Q


academicYear = {
        "FR": "Freshman",
        "SO": "Sophomore",
        "JR": "Junior",
        "SR": "Senior",
        "GR": "Graduate"
        }

class CreateUserView(CreateAPIView):
    model = get_user_model()
    permission_classes = [
            permissions.AllowAny
            ]
    serializer_class = CustomUserSerializer

class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)

#        responseHeaders = {'Set-Cookie': 'userID=' + str(user.pk)}
#
#        return Response({
#            'token': token.key,
#            'user_id': user.pk,
#            'email': user.email
#            }, headers=responseHeaders)
        response = Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email
            })
#        response.set_cookie('userID',user.pk, domain='')
        response.set_cookie('userID',user.pk)
        return response

class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [permissions.IsAuthenticated]

class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]


class UserMajorViewSet(viewsets.ModelViewSet):
    queryset = UserMajorMap.objects.all()
    serializer_class = UserMajorSerializer
    permission_classes = [permissions.IsAuthenticated]

class MajorViewSet(viewsets.ModelViewSet):
    queryset = Major.objects.all()
    serializer_class = MajorSerializer
    permission_classes = [permissions.IsAuthenticated]

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

# this endpoint will render a JSON view of 
# all the courses offered by the user's current school
class SchoolCourses(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):

        try:
            obj = CustomUser.objects.get(pk=request.user.id)
        except ObjectDoesNotExist:
            raise Http404
        self.check_object_permissions(self.request, obj)

        courses_at_users_schoolQS = Course.objects.filter(school_offering_id = request.user.school.id)
        courses_serialized = CourseSerializer(courses_at_users_schoolQS, many = True)
        return Response(courses_serialized.data)

# this endpoint will render list of courses 
# based on user input of either course name or code
class SearchCourses(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, format=None):
        try:
            obj = CustomUser.objects.get(pk=request.user.id)
        except ObjectDoesNotExist:
            raise Http404
        self.check_object_permissions(self.request, obj)

        try:
            user_input = request.data['course_input']
        except KeyError:
            return Response({'error': "You probably forgot to pass in 'course_input' parameter."}, status=status.HTTP_400_BAD_REQUEST)

        courses_foundQS = Course.objects.filter(school_offering_id = request.user.school.id).filter(Q(course_code__icontains = user_input) | Q(name__icontains = user_input))

        courses_serialized = CourseSerializer(courses_foundQS, many=True)
        return Response(courses_serialized.data)

class UserCoursesViewSet(viewsets.ModelViewSet):
    queryset = UserCoursesMap.objects.all()
    serializer_class = UserCoursesSerializer
    permission_classes = [permissions.IsAuthenticated]

class ApptDetailsViewSet(viewsets.ModelViewSet):
    queryset = ApptDetails.objects.all()
    serializer_class = ApptDetailsSerializer
    permission_classes = [permissions.IsAuthenticated]

class ApptRequestsViewSet(viewsets.ModelViewSet):
    queryset = ApptRequests.objects.all()
    serializer_class = ApptRequestsSerializer
    permission_classes = [permissions.IsAuthenticated]

#    @action(detail=True, methods=['post'])
#    def request_appt(self, request, pk=None):
#        subject_ipt = request.data['subject']
#        location_ipt = request.data['location']
#        date_ipt = request.data['date']
#        time_ipt = request.data['time']
#
#        date1 = datetime.date.fromisoformat(date_ipt)
#        time1 = datetime.time.fromisoformat(time_ipt)
#        date_final = datetime.datetime(date1.year, date1.month, date1.day, time1.hour, time1.minute, tzinfo=datetime.timezone.utc)
#        appt = ApptDetails(subject=subject_ipt, date_and_time=date_final, location=location_ipt)
#        appt.save()
#
#        appt_details_id = appt.id
##        student_id = int(request.data['student_id'])
#        student_id = request.user.id
#        tutor_id = int(request.data['tutor_id'])
#        appt_request = ApptRequests(pending = 1, appt_details_id = appt_details_id, student_id = student_id, tutor_requested_id = tutor_id)
#        appt_request.save()
#
#        return Response(ApptRequestsSerializer(appt_request), status=status.HTTP_201_CREATED)

class RequestAppt(APIView):

    def post(self, request, format=None):
        subject_ipt = request.data['subject']
        location_ipt = request.data['location']
        date_ipt = request.data['date']
        time_ipt = request.data['time']

        date1 = datetime.date.fromisoformat(date_ipt)
        time1 = datetime.time.fromisoformat(time_ipt)
        date_final = datetime.datetime(date1.year, date1.month, date1.day, time1.hour, time1.minute, tzinfo=datetime.timezone.utc)
        appt = ApptDetails(subject=subject_ipt, date_and_time=date_final, location=location_ipt)
        appt.save()

        appt_details_id = appt.id
#        student_id = int(request.data['student_id'])
        student_id = request.user.id
        tutor_id = int(request.data['tutor_id'])
        appt_request = ApptRequests(pending = 1, appt_details_id = appt_details_id, student_id = student_id, tutor_requested_id = tutor_id)
        appt_request.save()

        return Response(ApptRequestsSerializer(appt_request).data, status=status.HTTP_201_CREATED)




class TutorProfileViewSet(viewsets.ModelViewSet):
    queryset = TutorProfile.objects.all()
    serializer_class = TutorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

class TutorsFoundByCourse(APIView):
    def get(self, request, pk, format=None):
        # going to try to pass a list of dict objects instead of a dict as a JSON response instead
        tutorsFound = []
        usersCoursesQS = UserCoursesMap.objects.filter(taking_course_id = pk)
        users_courses_and_tutors = list(filter(lambda usercourse: usercourse.user.groups.filter(name__icontains = "tutor").exists(), usersCoursesQS))
        tutors = [users_courses.user for users_courses in users_courses_and_tutors]
        for tutor in tutors:
            try:
                tutor_profile = TutorProfile.objects.get(user=tutor.id)
                tutorsFound.append({'id': tutor.id, 'first_name' : tutor.first_name, 'last_name': tutor.last_name, 'about': tutor_profile.about})
            except ObjectDoesNotExist:
                # if tutor hasn't set their 'about' section, a record in 
                # TutorProfile model has yet to be created and so we have 
                # to skip/pass trying to read/identify a record in that table
                # for those tutors
                tutorsFound.append({'id': tutor.id, 'first_name' : tutor.first_name, 'last_name': tutor.last_name, 'about': "Tutor hasn't set their 'About' section yet."})
                pass
        return Response(tutorsFound)






#going to unmap this function based view in urls so its unreachable
#because we've changed to a class based view instead because
#we needed to provide custom permissions
@api_view(['GET'])
def SchoolMajorsView(request, pk):
    #try testing to see if we can just use 'request.user.id' like we can
    #in regular django framework so we don't have to specifiy 'pk' parameter
    auser = CustomUser.objects.get(pk=pk)
    schoolSerialized = SchoolSerializer(auser.school, context={'request': request})
    majorsQS = UserMajorMap.objects.filter(user_id=pk)
    majorsSerialized = UserMajorSerializer(majorsQS, many=True, context={'request': request})
    combinedData = {}
    combinedData['school'] = schoolSerialized.data
    combinedData['majors'] = majorsSerialized.data
    return Response(combinedData)

class flattenedSchoolMajorsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsUser]


    def get(self, request, pk, format=None):
#        try:
#            user_from_url = CustomUser.objects.get(pk=pk) 
#        except:
#            raise Http404
#        if not user_from_url == request.user:
#            raise PermissionDenied
        try:
            obj = CustomUser.objects.get(pk=pk)
        except ObjectDoesNotExist:
            raise Http404
        self.check_object_permissions(self.request, obj)

        a_user = CustomUser.objects.get(pk=pk)
        finalData = {}
        finalData['school'] = {}
        finalData['school']['id'] = a_user.school.id
        finalData['school']['name'] = a_user.school.name
        majorsQS = UserMajorMap.objects.filter(user_id=pk)
        finalData['majors'] = []
        for mapping in majorsQS:
            finalData['majors'].append({'id':mapping.major.id, 'major':mapping.major.major})
        return Response(finalData)

class UserGroup(APIView):
    permission_classes = [permissions.IsAuthenticated, IsUser]

    def get(self, request, pk, format=None):
        try:
            obj = CustomUser.objects.get(pk=pk)
        except ObjectDoesNotExist:
            raise Http404
        self.check_object_permissions(self.request, obj)
        return Response({'groups': [record for record in obj.groups.values()]})


    def post(self, request, pk, format=None):
        try:
            obj = CustomUser.objects.get(pk=pk)
        except ObjectDoesNotExist:
            raise Http404
        self.check_object_permissions(self.request, obj)

        group_selected = request.data['groups']
        if "tutor" in group_selected:
            obj.groups.add(1)
        elif "student" in group_selected:
            obj.groups.add(2)
        else:
            return Response({'error': 'Sorry, group selected not recognized'}, status=status.HTTP_400_BAD_REQUEST)
#        return Response(obj.groups.values()[0], status=status.HTTP_201_CREATED)
        return Response({'groups': [record for record in obj.groups.values()]}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def flattenedBasicUserView(request, pk):
    try:
        theUser = CustomUser.objects.get(pk=pk)
    except ObjectDoesNotExist:
            raise Http404
    if not theUser == request.user:
        raise PermissionDenied
    userDict = {}
    userDict['email'] = theUser.email
    userDict['first_name'] = theUser.first_name
    try:
        userDict['groups'] = theUser.groups.values()[0]['name']
    except IndexError:
        userDict['groups'] = ""
    userDict['last_name'] = theUser.last_name
    userDict['school'] = theUser.school.name
    userDict['school'] = {theUser.school.id: theUser.school.name}
    userDict['username'] = theUser.username
    userDict['year'] = academicYear[theUser.year]
    flattenedUser = flatBasicUserSerializer(userDict)
    return Response(flattenedUser.data)

@api_view(['GET'])
def flattenedUserCoursesView(request):
    try:
        theUser = CustomUser.objects.get(pk=request.user.id)
    except ObjectDoesNotExist:
            raise Http404
    if not theUser == request.user:
        raise PermissionDenied

#    userCoursesDict = {}
#    userCoursesQS = UserCoursesMap.objects.filter(user=theUser.id)
#    for course in userCoursesQS:
#        userCoursesDict[course.id] = {course.taking_course.course_code: course.taking_course.name}
#    return Response(userCoursesDict)

    users_courses_mapQS = UserCoursesMap.objects.filter(user = theUser.id)
    users_courses = [course.taking_course for course in users_courses_mapQS]
    users_courses_serialized = CourseSerializer(users_courses, many = True)
    return Response(users_courses_serialized.data)


@api_view(['GET'])
def flattenedApptRequestsView(request):
    theUser = CustomUser.objects.get(pk=request.user.id)
    appts = {}
#    if (theUser.groups.values()[0]['name'] == 'tutors'):
    if (theUser.groups.filter(name__contains="tutor")):
        requestsQS = ApptRequests.objects.filter(tutor_requested_id=request.user.id)
        if (requestsQS.exists()):
            requestsQS_ordered = requestsQS.order_by('appt_details__date_and_time')
            for request in requestsQS_ordered:
                appts[request.id] = {
                        'approval': request.approval,
                        'notes': request.notes,
                        'appt_details': {
                            'id': request.appt_details.id,
                            'subject': request.appt_details.subject,
                            'date_time': request.appt_details.date_and_time,
                            'location': request.appt_details.location
                            },
                        'student': {
                            'id': request.student.id,
                            'name': request.student.first_name + ' ' + request.student.last_name
                            },
                        'pending': request.pending
                        }
        else:
            appts['error'] = "Sorry, no appointments have been made yet."
    else:
        requestsQS = ApptRequests.objects.filter(student_id=request.user.id)
        if (requestsQS.exists()):
            requestsQS_ordered = requestsQS.order_by('appt_details__date_and_time')
            for request in requestsQS_ordered:
                appts[request.id] = {
                        'approval': request.approval,
                        'notes': request.notes,
                        'appt_details': {
                            'id': request.appt_details.id,
                            'subject': request.appt_details.subject,
                            'date_time': request.appt_details.date_and_time,
                            'location': request.appt_details.location
                            },
                        'tutor': {
                            'id': request.id,
                            'name': request.tutor_requested.first_name + ' ' + request.tutor_requested.last_name
                            },
                        'pending': request.pending
                        }
        else:
            appts['error'] = "Sorry, no appointments have been made yet."
    return Response(appts)



@api_view(['GET'])
def OrderedApptRequestsView(request):
    theUser = CustomUser.objects.get(pk=request.user.id)
#    if (theUser.groups.filter(name__contains="tutor")):
    requestsQS = ApptRequests.objects.filter(Q(tutor_requested_id=request.user.id) | Q(student_id = request.user.id))
    if (requestsQS.exists()):
        requestsQS_ordered = requestsQS.order_by('appt_details__date_and_time')
        requests_serialized = ApptRequestsSerializer(requestsQS_ordered, many = True)
    else:
        return Response({'status': 'Sorry, no appointment requests have been made.'})
        
#    else:
#        requestsQS = ApptRequests.objects.filter(student_id=request.user.id)
#        if (requestsQS.exists()):
#            requestsQS_ordered = requestsQS.order_by('appt_details__date_and_time')
#            requests_serialized = ApptRequestsSerializer(requestsQS_ordered, many = True)
#        else:
#            return Response({'status': 'Sorry, no appointment requests have been made.'})
    return Response(requests_serialized.data)


    

# an API endpoint to view/lookup list of school's matching user's input
class SchoolView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, uinput):
        schools = School.objects.filter(name__icontains=uinput)
        schools_serialized = SchoolSerializer(schools, many = True, context= {'request': request} )
        return Response(schools_serialized.data)

class ApproveRequest(APIView):
    permission_classes = [permissions.IsAuthenticated]

    #endpoint should be passed the id/pk of the ApptRequest instance
    def post(self, request, pk, format=None):
        try:
            appt_notes = request.data['notes']
        except KeyError:
            return Response({'error': "You forgot to pass in value for 'notes' parameter"}, status = status.HTTP_400_BAD_REQUEST)
        try: 
            appt_request = ApptRequests.objects.get(id = pk)
            obj = appt_request.tutor_requested
        except ObjectDoesNotExist:
            raise Http404

        self.check_object_permissions(self.request, obj)

        if not appt_request.tutor_requested_id == request.user.id:
            raise PermissionDenied

        appt_request.approval = 1
        appt_request.notes = appt_notes
        appt_request.pending = 0
        appt_request.save()
        return Response({'status': 'Appointment request approved'}, status=status.HTTP_200_OK)

class DenyRequest(APIView):
    permission_classes = [permissions.IsAuthenticated]

    #endpoint should be passed the id/pk of the ApptRequest instance
    def post(self, request, pk, format=None):
        try:
            appt_notes = request.data['notes']
        except KeyError:
            return Response({'error': "You forgot to pass in value for 'notes' parameter"}, status = status.HTTP_400_BAD_REQUEST)
        try: 
            appt_request = ApptRequests.objects.get(id = pk)
            obj = appt_request.tutor_requested
        except ObjectDoesNotExist:
            raise Http404

        self.check_object_permissions(self.request, obj)

        if not appt_request.tutor_requested_id == request.user.id:
            raise PermissionDenied

        appt_request.approval = 0
        appt_request.notes = appt_notes
        appt_request.pending = 0
        appt_request.save()
        return Response({'status': 'Appointment request denied'}, status=status.HTTP_200_OK)

class AddCourse(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, format=None):
        try:
           course_id = request.data['course_pk']
        except KeyError:
            return Response({'status': '"course_pk" parameter missing'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            year = int(request.data['year'])
        except KeyError:
            return Response({'status': '"year" parameter missing'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            semester = int(request.data['semester'])
        except KeyError:
            return Response({'status': '"semester" parameter missing'}, status=status.HTTP_400_BAD_REQUEST)

        new_course = UserCoursesMap(taking_course_id=course_id, user_id=request.user.id, year_taken=year, semester=semester)
        new_course.save()
        return Response({'status': "Added new course to user's profile"}, status=status.HTTP_201_CREATED)

class UpdateUserBasic(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, format=None):
        user_to_update = CustomUser.objects.get(id=request.user.id)
        user_serialized = BasicUserSerializer(user_to_update, data=request.data, partial=True)
        if user_serialized.is_valid():
            user_serialized.update(user_to_update, request.data)
            try:
                about_ipt = request.data['about']
                if (not(about_ipt == '')):
                    tutor_profileQS = TutorProfile.objects.filter(user_id=request.user.id)
                    if tutor_profileQS.exists():
                        tutor_profile_to_update = tutor_profileQS.first()
                        tutor_profile_serialized = TutorProfileSerializer(tutor_profile_to_update, data=request.data, partial = True)
                        if tutor_profile_serialized.is_valid():
                            tutor_profile_serialized.update(tutor_profile_to_update, request.data)
                            user_dict = dict(user_serialized.data)
                            tutor_dict = dict(tutor_profile_serialized.data)
                            user_dict.update(tutor_dict)
                            return Response(user_dict)
                        else:
                            return Response(tutor_profile_serialized.errors)
                    else:
                        new_tutor_profile = TutorProfile(about = request.data['about'], user_id = request.user.id)
                        new_tutor_profile.save()
                        tutor_profile_serialized = TutorProfileSerializer(new_tutor_profile)
                        user_dict = dict(user_serialized.data)
                        tutor_dict = dict(tutor_profile_serialized.data)
                        user_dict.update(tutor_dict)
                        return Response(user_dict)
            except KeyError:
                return Response(user_serialized.data)
        else:
            return Response(user_serialized.errors)


