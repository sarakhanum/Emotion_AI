from django.db import models

class UserAccount(models.Model):
    username = models.CharField(max_length=100, unique=True)
    password = models.CharField(max_length=100)

    def __str__(self):
        return self.username


class EmotionHistory(models.Model):
    username = models.CharField(max_length=100)
    emotion = models.CharField(max_length=50)
    confidence = models.FloatField(default=0)
    time_slot = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.emotion