from django.urls import path
from .views import signup, login, detect, emotion, emotion_history, weekly_report, dashboard_stats, notifications

urlpatterns = [
    path("signup/", signup),
    path("login/", login),
    path("detect/", detect),
    path("emotion/", emotion),
    path("history/", emotion_history),
    path("weekly-report/", weekly_report),
    path("dashboard-stats/", dashboard_stats),
    path("notifications/", notifications),
]