from django.db import models

#not sure if we should be placing the below snippet in this app's
#models.py module or in the other app's 'models.py' module. i 
#think as long as we have it in a module that's executed at 
#startup when starting up django, it should be ok.
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token

def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)
