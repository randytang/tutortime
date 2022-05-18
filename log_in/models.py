from django.db import models

from django.contrib.auth.models import AbstractUser
from datetime import date

# Create your models here.

class School(models.Model):
    name = models.CharField(max_length=100, unique=True)

class Major(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, unique=False)
    major = models.CharField(max_length=100, unique=False)

    #lol, should I separate school field out of 'Major' model
    #and create a separate model that has 2 foreign keys mapping
    #'Major' model and 'School' model? and have this model referenced
    #by 'major' field in 'CustomUser' model?

class CustomUser(AbstractUser):
    FRESHMAN = 'FR'
    SOPHOMORE = 'SO'
    JUNIOR = 'JR'
    SENIOR = 'SR'
    GRADUATE = 'GR'
    YEAR_IN_SCHOOL_CHOICES = [
            (FRESHMAN, 'Freshman'),
            (SOPHOMORE, 'Sophomore'),
            (JUNIOR, 'Junior'),
            (SENIOR, 'Senior'),
            (GRADUATE, 'Graduate'),
            ]
#    major = models.CharField(max_length=100, blank=True)
    year = models.CharField(
            max_length=2,
            choices=YEAR_IN_SCHOOL_CHOICES,
            default=FRESHMAN,
            blank=True
            )

    #we should prolly create a separate model for school
    #in anticipation of having another model that will
    #map school and their majors
    #if that's the case, we need to change above line for 'major'
    #to be a foreign key to a 'major' model/table
    school = models.ForeignKey(School, on_delete=models.CASCADE, null=True)
    #email = models.EmailField()
    #lol, django's auth user model already has a field for email
    #so we don't need to specify this field

    #tutor fields
    rate = models.DecimalField(decimal_places=2, max_digits=5, blank=True, null=True)

    #student fields
    #lol, i just realized, we're going to probably have to have
    #a separate table/model where we map the tutors to students or
    #vice versa and the relationship will probably be a many-to-many
    #i wonder though, can a database field be recursive? in other words
    #can it reference itself?
    #courses = 
    #we might have a similar situation with 'courses' field in that
    #we'll need a separate model/table that maps courses to students
    #for which the relationship will be one-to-many




class UserMajorMap(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    major = models.ForeignKey(Major, on_delete=models.CASCADE)

    #note: read up on django's "OneToMany" model relationship to see if
    #instead of creating separate table to map user and major,
    #we can instead just create a new field for user to point to
    #the different major's a student may have

class Course(models.Model):
    course_code = models.CharField(max_length=10, unique=False)
    name = models.CharField(max_length=100, unique=False)
    school_offering = models.ForeignKey(School, on_delete=models.CASCADE, null=True)
    #i have to review how to set a multi-column unique constraint so
    #i can force uniqueness for course_code AND school.

    class Meta:
        constraints = [
                models.UniqueConstraint(fields=['course_code', 'school_offering'], name='unique_school_course')
                ]

#im starting to question the need for this model/table and instead
# have a field in "Course" model/table that is a foreign key pointing
#to "School" table/model. 
#class SchoolCoursesMap(models.Model):
#   school = models.ForeignKey(School, on_delete=models.CASCADE, unique=False) 
#   course = models.ForeignKey(Course, on_delete=models.CASCADE)

class UserCoursesMap(models.Model):
    SPRING = 0 
    SUMMER = 1 
    FALL = 2
    WINTER = 3
    SEMESTER_CHOICES = [
            (SPRING, 'Spring'),
            (SUMMER, 'Summer'),
            (FALL, 'Fall'),
            (WINTER, 'Winter'),
            ]
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    #taking_course = models.ForeignKey(SchoolCoursesMap, on_delete=models.CASCADE)
    taking_course = models.ForeignKey(Course, on_delete=models.CASCADE)

    semester = models.IntegerField(
            choices=SEMESTER_CHOICES,
            default=FALL,
            )

    #might need a validator to check if year entered is greater than
    #current year or at least not further into the future than next/upcoming
    #semester.
    year_taken = models.IntegerField(default=date.today().year, blank=True)


class TutorProfile(models.Model):
    user = models.ForeignKey(CustomUser, on_delete = models.CASCADE)
    about = models.TextField()
    
class ApptDetails(models.Model):
    subject = models.CharField(max_length = 100)
    #html5 has input types for 'date' and 'time' but i double checked django docs and 
    #it looks like the default widget for rendering a DateField is an input of type 'text' so 
    #not sure why it's not type 'date' but regardless of the type, when we retrieve the value
    #after form submission, what will the value look like and will we have to instantiate
    #a python date object out of/using that value? or will we be able to automatically pass 
    #it into the table/model field and save? if the former, we might have to use regex to extract
    #the day, month, and year from the string value and instantiate accordingly.

    #date = models.DateField()

    #for 'DateTimeField' django uses python's 'datetime.datetime' instance. can that instance just
    #hold the time or does it have to hold date and time? constructor looks like it doesn't have
    #default values for the date so we might have to create a 'date' object first from 'date' input element
    #then use time value from input element and combine to instantiate datetime instance.
    #LOL, on second thought, we may not need 2 separate fields, 'date' and 'time' for table/model. if
    #there is a 'datetime' field, why not just have one model field and pass in both values, date and time 
    #from input elements?
    #time = models.DateTimeField()
    date_and_time = models.DateTimeField()
    #TODO: change field type for location to perhaps foreign key pointing to table/model that maps
    #building locations and room numbers. that table/model should maybe have 'remote' instance/record
    location = models.CharField(max_length = 50)



class ApptRequests(models.Model):
#    student = models.ForeignKey(CustomUser, on_delete = models.CASCADE)
#    tutor_requested = models.ForeignKey(CustomUser, on_delete = models.CASCADE)
    #i guess many-to-many fields don't use the 'on_delete' keyword parameter. i'll have to read up on theory
#    student = models.ManyToManyField(CustomUser)
#    tutor_requested = models.ManyToManyField(CustomUser)
    student = models.ForeignKey(CustomUser, on_delete = models.CASCADE, related_name = "students")
    tutor_requested = models.ForeignKey(CustomUser, on_delete = models.CASCADE, related_name = "tutors")
    appt_details = models.ForeignKey(ApptDetails, on_delete = models.CASCADE)
    #i think we need a 'pending' field that updates/changes depending on another field i.e 'approved'
    #if request was approved/denied, it updates 'pending' field to 'closed' or '1' being closed, '0' for open.
    pending = models.BooleanField(default=1)
    approval = models.BooleanField(null=True, blank=True)
    #below field will be for when the tutor approves the request, and adds in 'notes' field further info
    #about the tutoring session i.e if remote, zoom/google link.
    notes = models.TextField(null=True, blank=True)


