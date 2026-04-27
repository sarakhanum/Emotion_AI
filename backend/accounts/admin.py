from django.contrib import admin
from .models import UserAccount, EmotionHistory

admin.site.register(UserAccount)
admin.site.register(EmotionHistory)