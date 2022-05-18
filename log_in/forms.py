from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser
from django import forms

class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = CustomUser
        #lol, so django is telling us we need to specify "fields".
        #but if we're inheriting from another modelForm,
        #how do we specify just those same exact fields
        fields = ('username',)

class PasswordResetRequestForm(forms.Form):
    email = forms.EmailField()
