from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import UserAccount, EmotionHistory
from django.db.models import Count, Avg
from django.db.models.functions import TruncDate
from datetime import datetime, timedelta
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from collections import Counter

import subprocess
import os
import base64
import cv2
import numpy as np
from deepface import DeepFace


# ---------------- SIGNUP ----------------
@api_view(['POST'])
def signup(request):
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response({"error": "All fields required"})

    if UserAccount.objects.filter(username=username).exists():
        return Response({"error": "Username already exists"})

    UserAccount.objects.create(username=username, password=password)
    return Response({"message": "Account created"})


# ---------------- LOGIN ----------------
@api_view(['POST'])
def login(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = UserAccount.objects.filter(
        username=username,
        password=password
    ).first()

    if user:
        return Response({"message": "Login success"})
    else:
        return Response({"error": "Invalid credentials"})


# ---------------- CAMERA START ----------------
@api_view(['GET'])
def detect(request):
    root = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..")
    )

    file_path = os.path.join(root, "live_emotion.py")

    subprocess.Popen(f'start cmd /k python "{file_path}"', shell=True)

    return Response({"message": "Camera started"})


def parse_timestamp(timestamp_value):
    if not timestamp_value:
        return timezone.now()

    try:
        if isinstance(timestamp_value, (int, float)):
            return timezone.make_aware(datetime.fromtimestamp(timestamp_value / 1000.0))

        if isinstance(timestamp_value, str):
            parsed = parse_datetime(timestamp_value)
            if parsed:
                return timezone.make_aware(parsed) if timezone.is_naive(parsed) else parsed
    except Exception:
        pass

    return timezone.now()


EMOTION_SCORES = {
    "happy": 95,
    "surprise": 85,
    "neutral": 70,
    "sad": 35,
    "angry": 25,
    "fear": 30,
    "disgust": 20,
}


def get_emotion_score(emotion):
    return EMOTION_SCORES.get(emotion.lower(), 50)


def calculate_entry_mood(entry):
    confidence = entry.confidence or 0
    return get_emotion_score(entry.emotion) * (confidence / 100.0)


# ---------------- LIVE EMOTION DETECTION ----------------
@api_view(['POST'])
def emotion(request):
    img_data = request.data.get("image").split(",")[1]
    img_bytes = base64.b64decode(img_data)

    np_arr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    result = DeepFace.analyze(
        img,
        actions=['emotion'],
        enforce_detection=False,
        detector_backend="opencv"
    )

    if isinstance(result, list):
        result = result[0]

    region = result.get("region", {})

    # ignore fake/small detections
    if region.get("w", 0) < 60 or region.get("h", 0) < 60:
        return Response({
            "emotion": "no face detected",
            "confidence": 0
        })

    emotion = result["dominant_emotion"]
    confidence = result["emotion"][emotion]

    # ---------------- USERNAME ----------------
    username = request.data.get("username", "guest")

    # ---------------- TIME SLOT ----------------
    hour = datetime.now().hour

    if hour < 12:
        time_slot = "Morning"
    elif hour < 18:
        time_slot = "Evening"
    else:
        time_slot = "Night"

    created_at = parse_timestamp(request.data.get("timestamp"))

    # ---------------- SAVE DATABASE ----------------
    EmotionHistory.objects.create(
        username=username,
        emotion=emotion,
        confidence=round(confidence, 2),
        time_slot=time_slot,
        created_at=created_at
    )

    return Response({
        "emotion": emotion,
        "confidence": round(confidence, 2),
        "x": region["x"],
        "y": region["y"],
        "w": region["w"],
        "h": region["h"]
    })


# ---------------- HISTORY ----------------
@api_view(['GET'])
def emotion_history(request):
    username = request.GET.get("username", "")
    data = EmotionHistory.objects.all()
    if username:
        data = data.filter(username=username)

    data = data.order_by('-created_at')[:20]

    return Response([
        {
            "username": d.username,
            "emotion": d.emotion,
            "confidence": d.confidence,
            "time_slot": d.time_slot,
            "time": d.created_at.strftime("%Y-%m-%d %H:%M:%S")
        }
        for d in data
    ])


# ---------------- WEEKLY REPORT ----------------
@api_view(['GET'])
def weekly_report(request):
    username = request.GET.get("username", "")
    if not username:
        return Response({"error": "Username required"})

    today = timezone.now().date()
    start_date = today - timedelta(days=6)

    entries = EmotionHistory.objects.filter(
        username=username,
        created_at__date__range=[start_date, today]
    )

    grouped = {}
    for entry in entries:
        entry_date = entry.created_at.date().strftime("%Y-%m-%d")
        grouped.setdefault(entry_date, []).append(entry)

    weekly_trend = []
    daily_breakdown = []
    total_score = 0
    scored_days = 0

    for i in range(6, -1, -1):
        date = start_date + timedelta(days=i)
        date_str = date.strftime("%Y-%m-%d")
        day_name = date.strftime("%a")
        day_entries = grouped.get(date_str, [])

        if day_entries:
            day_score_sum = sum(calculate_entry_mood(entry) for entry in day_entries)
            average_score = round(day_score_sum / len(day_entries))
            average_confidence = round(sum(entry.confidence or 0 for entry in day_entries) / len(day_entries))
            total_score += average_score
            scored_days += 1
        else:
            average_score = 0
            average_confidence = 0

        weekly_trend.append({
            "day": day_name,
            "score": average_score,
            "averageConfidence": average_confidence,
            "count": len(day_entries)
        })

        daily_breakdown.append({
            "day": day_name,
            "score": average_score,
            "averageConfidence": average_confidence,
            "entries": len(day_entries)
        })

    most_frequent_emotion = "Neutral"
    most_frequent_count = 0
    most_frequent_percentage = 0
    if entries.exists():
        emotion_counts = Counter(entry.emotion.lower() for entry in entries)
        most_common_emotion, most_frequent_count = emotion_counts.most_common(1)[0]
        total_entries = len(entries)
        most_frequent_percentage = round((most_frequent_count / total_entries) * 100)
        most_frequent_emotion = most_common_emotion.capitalize()
    else:
        emotion_counts = {}
        total_entries = 0

    best_day_data = max(daily_breakdown, key=lambda item: item["score"])
    weekly_average_mood = round(total_score / scored_days) if scored_days > 0 else 0

    return Response({
        "bestDay": {
            "day": best_day_data["day"],
            "score": best_day_data["score"],
            "reason": "Highest average mood score"
        },
        "mostFrequentEmotion": {
            "emotion": most_frequent_emotion,
            "count": most_frequent_count,
            "percentage": most_frequent_percentage
        },
        "weeklyAverageMood": weekly_average_mood,
        "weeklyTrend": weekly_trend,
        "dailyBreakdown": daily_breakdown,
        "totalEntries": total_entries,
        "emotionDistribution": [
            {
                "emotion": emotion.capitalize(),
                "count": count,
                "percentage": round((count / total_entries) * 100) if total_entries else 0
            }
            for emotion, count in emotion_counts.items()
        ]
    })


# ---------------- DASHBOARD STATS ----------------
@api_view(['GET'])
def dashboard_stats(request):
    username = request.GET.get("username", "")

    if not username:
        return Response({"error": "Username required"})

    # Today's date
    today = timezone.now().date()

    # Today's detections
    today_detections = EmotionHistory.objects.filter(
        username=username,
        created_at__date=today
    )

    detection_count = today_detections.count()

    # Average confidence today
    avg_confidence = 0
    if detection_count > 0:
        avg_confidence = round(today_detections.aggregate(Avg('confidence'))['confidence__avg'], 1)

    # Most common emotion today
    top_emotion = "neutral"
    if detection_count > 0:
        emotion_counts = today_detections.values('emotion').annotate(count=Count('emotion')).order_by('-count')
        if emotion_counts:
            top_emotion = emotion_counts[0]['emotion']

    # Today's emotion distribution for pie chart
    emotions_data = []
    if detection_count > 0:
        emotion_distribution = today_detections.values('emotion').annotate(count=Count('emotion')).order_by('-count')
        for item in emotion_distribution:
            emotions_data.append({
                "emotion": item['emotion'],
                "count": item['count']
            })

    # Weekly trend (last 7 days)
    weekly_trend = []
    for i in range(6, -1, -1):
        date = today - timedelta(days=i)
        count = EmotionHistory.objects.filter(
            username=username,
            created_at__date=date
        ).count()
        weekly_trend.append({
            "day": date.strftime("%a"),
            "count": count
        })

    return Response({
        "stats": {
            "detectionCount": detection_count,
            "averageConfidence": avg_confidence,
            "todayEmotion": top_emotion,
            "weeklyTrend": weekly_trend
        },
        "emotions": emotions_data
    })


# ---------------- NOTIFICATIONS ----------------
@api_view(['GET'])
def notifications(request):
    username = request.GET.get("username", "")

    if not username:
        return Response({"error": "Username required"})

    notifications_list = []
    unread_count = 0

    # Today's date and time
    now = timezone.now()
    today = now.date()

    # 1. Weekly report ready (if it's been 7+ days since last report generation)
    last_week = now - timedelta(days=7)
    recent_reports = EmotionHistory.objects.filter(
        username=username,
        created_at__gte=last_week
    ).count()

    if recent_reports > 10:  # If user has been active
        notifications_list.append({
            "id": "weekly_report",
            "message": "Weekly report is ready! Check your emotional patterns.",
            "type": "report",
            "created_at": now.isoformat()
        })
        unread_count += 1

    # 2. Happiness increase detection
    last_7_days = EmotionHistory.objects.filter(
        username=username,
        created_at__gte=now - timedelta(days=7)
    )

    if last_7_days.count() > 5:
        happy_count = last_7_days.filter(emotion='happy').count()
        total_count = last_7_days.count()
        happy_percentage = (happy_count / total_count) * 100

        if happy_percentage > 60:
            notifications_list.append({
                "id": "happiness_increase",
                "message": f"Happiness increased {happy_percentage:.0f}% this week! Keep it up! 🎉",
                "type": "success",
                "created_at": now.isoformat()
            })
            unread_count += 1

    # 3. Stress detection (high anger/sad detections)
    yesterday = today - timedelta(days=1)
    yesterday_detections = EmotionHistory.objects.filter(
        username=username,
        created_at__date=yesterday
    )

    if yesterday_detections.count() > 3:
        stress_emotions = ['angry', 'sad', 'fear']
        stress_count = yesterday_detections.filter(emotion__in=stress_emotions).count()
        stress_percentage = (stress_count / yesterday_detections.count()) * 100

        if stress_percentage > 50:
            notifications_list.append({
                "id": "stress_detected",
                "message": f"Stress detected yesterday evening. Consider relaxation activities.",
                "type": "warning",
                "created_at": now.isoformat()
            })
            unread_count += 1

    # 4. Streak detection
    streak_days = 0
    for i in range(30):  # Check last 30 days
        check_date = today - timedelta(days=i)
        day_count = EmotionHistory.objects.filter(
            username=username,
            created_at__date=check_date
        ).count()
        if day_count > 0:
            streak_days += 1
        else:
            break

    if streak_days >= 5:
        notifications_list.append({
            "id": "streak_achievement",
            "message": f"You maintained a {streak_days} day streak! You're doing amazing! 🔥",
            "type": "achievement",
            "created_at": now.isoformat()
        })
        unread_count += 1

    # 5. Mood prediction ready
    recent_detections = EmotionHistory.objects.filter(
        username=username,
        created_at__gte=now - timedelta(days=1)
    ).count()

    if recent_detections >= 3:
        notifications_list.append({
            "id": "prediction_ready",
            "message": "Mood prediction ready for tomorrow. Check your predictions page!",
            "type": "info",
            "created_at": now.isoformat()
        })
        unread_count += 1

    # 6. No tracking today reminder
    today_count = EmotionHistory.objects.filter(
        username=username,
        created_at__date=today
    ).count()

    if today_count == 0 and now.hour >= 18:  # After 6 PM
        notifications_list.append({
            "id": "no_tracking_today",
            "message": "No emotion tracking data today. Don't forget to check in!",
            "type": "reminder",
            "created_at": now.isoformat()
        })
        unread_count += 1

    # Sort notifications by created_at (most recent first)
    notifications_list.sort(key=lambda x: x['created_at'], reverse=True)

    return Response({
        "notifications": notifications_list,
        "unread_count": unread_count
    })