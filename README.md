# 🎭 Emotion AI

An intelligent **real-time emotion detection and mood analytics platform** built using **React.js** and AI-powered facial emotion recognition.  
Emotion AI analyzes live webcam expressions, detects emotions instantly, stores mood history, and provides personalized recommendations, insights, reports, rewards, and predictions.

---

## 🚀 Features

### 🎥 Real-Time Emotion Detection
- Detects emotions using webcam in real time
- Supports:
  - 😊 Happy
  - 😐 Neutral
  - 😢 Sad
  - 😠 Angry
  - 😨 Fear
  - 😮 Surprise
  - 🤢 Disgust

### 📊 Mood Tracker Dashboard
- Today's mood with confidence %
- Weekly mood trends
- Daily mood score
- Mood intensity over time
- Emotion distribution charts

### 🧠 AI Predictions
- Predicts tomorrow’s mood based on historical data
- Uses recent trends and confidence scores
- 7-Day mood forecast graph

### 📅 Weekly Reports
- Daily mood breakdown
- Mood trends over week
- Success rate based on positivity
- Best mood day
- Most frequent emotion
- AI insights & recommendations

### ✅ Tasks & Suggestions
Real-time mood-based suggestions:

- **Happy** → Creative work, social tasks
- **Sad** → Self-care, music, light productivity
- **Neutral** → Focus work, planning, learning
- **Angry** → Relaxation, breathing, exercise

### 💬 AI Chat Assistant
Smart chatbot with mood-aware replies:

- Motivation
- Jokes
- Mood advice
- Suggestions
- Emotional support

### 🏆 Rewards & Badges
- Earn points for daily usage
- Unlock badges
- Claim rewards
- Track progress

### 🔐 Authentication
- User Login / Signup
- Personalized mood history

---

## 🛠️ Tech Stack

### Frontend
- React.js
- React Router DOM
- Framer Motion
- Recharts
- CSS3

### AI / Emotion Detection
- Face Emotion Recognition Model
- Webcam Detection API

### Storage
- LocalStorage
- Django Backend API (optional)

---

## 📂 Project Structure

```bash
emotion_ai/
│── public/
│── src/
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   ├── MoodTracker.jsx
│   │   ├── WeeklyReports.jsx
│   │   ├── Predictions.jsx
│   │   ├── TasksSuggestions.jsx
│   │   ├── ChatAssistant.jsx
│   │   └── Rewards.jsx
│   │
│   ├── utils/
│   │   └── emotionStorage.js
│   │
│   ├── App.js
│   └── index.js
