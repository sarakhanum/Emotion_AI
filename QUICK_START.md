# 🚀 Quick Start Guide - Real-Time Mood Tracker

## What Was Upgraded?

Your Mood Tracker dashboard now displays **REAL emotion detection data** instead of dummy values. All charts update automatically as emotions are detected from your webcam.

---

## 🎬 How to Use

### **Step 1: Start Emotion Detection**
1. Navigate to **Dashboard** page
2. Click **"▶️ Start Camera"** button
3. Allow camera access
4. Position your face in front of camera

### **Step 2: Watch Real-Time Detection**
- See emotion boxes drawn around your face
- Notice detection stats updating:
  - "Detections Today"
  - "Avg Confidence %"  
  - "Top Emotion"
- Pie chart shows emotion distribution

### **Step 3: View Full Analytics**
1. Navigate to **Mood Tracker** page
2. See all charts populated with REAL data:
   - **Today's Mood** - Latest detected emotion + confidence
   - **Weekly Mood Trend** - Average confidence per day
   - **Mood Intensity Over Time** - Confidence progression today
   - **Mood Distribution** - % of each emotion this week
   - **Daily Mood Score** - 7-day scores using formula
   - **Weekly Insights** - Auto-generated based on your data

### **Step 4: Auto-Updates**
- Charts refresh every 5 seconds automatically
- No manual refresh needed
- Data persists in browser even after closing

---

## 📊 What Each Chart Shows

### **Today's Mood Card**
- **Shows:** Latest emotion detected + its confidence %
- **Updates:** When new emotion is detected
- **Example:** "😊 Happy - 87%"

### **Weekly Mood Trend**
- **Shows:** 7 day cards with average confidence each day
- **Data:** Real confidence values from detected emotions
- **Visual:** Bars showing intensity per day

### **Mood Intensity Over Time (Line Chart)**
- **X-axis:** Time stamps from today (e.g., 10:30, 10:35, etc.)
- **Y-axis:** Confidence % (0-100)
- **Shows:** How confidence changed throughout your day
- **Real Data:** Based on actual detections

### **Mood Distribution This Week (Pie Chart)**
- **Shows:** Percentage breakdown of emotions
  - 😊 Happy, 😢 Sad, 😠 Angry, 😐 Neutral
  - 😮 Surprise, 😨 Fear, 🤢 Disgust
- **Real Data:** Counts emotions you've detected all week

### **Daily Mood Score (Bar Chart)**
- **Shows:** Mood score 0-100 for each day of week
- **Formula:** `(Happy + Surprise + Neutral×0.5) - (Sad + Angry + Fear + Disgust)`
- **Real Data:** Calculated from actual emotions you showed

### **Weekly Insights**
- **Shows:** Auto-generated insights like:
  - "Best mood: Tuesday with 82% score"
  - "Most frequent emotion: Happy (45%)"
  - "Your mood is trending positive this week! 📈"
- **Real Data:** Based on your 7-day emotion history

---

## 🔑 Key Features

### ✅ **Real-Time Updates**
- Detections appear instantly
- Charts auto-refresh every 5 seconds
- No manual button clicks needed

### ✅ **Smart Deduplication**
- Doesn't save same emotion twice in a row
- Stores every 5 seconds OR when emotion/confidence changes significantly
- Keeps data clean and minimal

### ✅ **Persistent Storage**
- All emotion data saved in browser
- Survives page refreshes
- Historical data available for 7-day analysis

### ✅ **No UI Changes**
- Same beautiful design
- All colors, fonts, layouts unchanged
- Only functionality upgraded

### ✅ **Automatic Insights**
- AI analyzes your mood patterns
- Shows trends (improving/declining)
- Identifies best/worst days

---

## 📝 Data Structure

Each emotion detection is saved as:
```
{
  date: "2026-04-27",
  time: "14:30:45",
  dominantEmotion: "happy",
  confidence: 87,           // 0-100%
  allEmotionScores: {
    happy: 0.87,
    sad: 0.02,
    angry: 0.01,
    neutral: 0.05,
    surprise: 0.03,
    fear: 0.01,
    disgust: 0.01
  }
}
```

---

## 🎯 Example Workflow

**1. Monday 10:00 AM** - Start camera
- Emotion: Happy 92%
- Dashboard shows: 1 detection, 92% avg confidence
- Pie chart: 100% Happy

**2. Monday 10:05 AM** - Same emotion (skipped due to deduplication)
- No new entry saved
- Stats unchanged

**3. Monday 10:07 AM** - Change to Neutral 88%
- Emotion: Neutral 88% (emotion changed + > 5 sec elapsed)
- Dashboard shows: 2 detections, 90% avg confidence
- Pie chart: 50% Happy, 50% Neutral

**4. Monday later** - Go to Mood Tracker
- Today's Mood: Neutral 88%
- Mood Intensity Chart: Shows Happy→Neutral progression
- Mood Distribution: 50% Happy, 50% Neutral
- Weekly Trend: Monday shows 90% average
- Daily Score: Monday gets ~75 score
- Insights: "Most frequent emotion: Happy and Neutral (50% each)"

**5. Tuesday onwards** - More detections build 7-day picture
- Charts populate with 7 days of data
- Insights compare and analyze trends

---

## 🛠️ Customization

### **Adjust How Often Data is Saved**
Edit `emotionStorage.js`, find:
```javascript
const MIN_TIME_BETWEEN_ENTRIES = 5000; // milliseconds
```
- `3000` = Save more frequently (every 3 sec)
- `10000` = Save less frequently (every 10 sec)

### **Adjust Confidence Sensitivity**
```javascript
const MIN_CONFIDENCE_CHANGE = 5; // percent
```
- `1` = Very sensitive (save on small confidence changes)
- `10` = Less sensitive (save only on big changes)

---

## ⚠️ Important Notes

1. **Camera Permission**: You must allow camera access in your browser
2. **Face Required**: Emotions only detected when face is in front of camera
3. **Browser Storage**: Data stored in browser, cleared if you clear cache
4. **Offline Works**: Charts work offline using stored data
5. **No Real-Time Sync**: Data doesn't sync across tabs/devices (each browser separate)

---

## ❓ Common Questions

**Q: Do I need to keep the camera on for charts to update?**
A: No, just need it on to collect emotion data. Charts use stored data.

**Q: Where is my data stored?**
A: Browser's localStorage. Survives page refreshes but not cache clearing.

**Q: Can I export my data?**
A: Yes, check localStorage in browser DevTools (F12 → Application → Local Storage)

**Q: Why are some emotions not showing?**
A: They weren't detected. Pie chart only shows emotions you actually displayed.

**Q: Can I delete my emotion history?**
A: Yes, go to browser DevTools → Application → Local Storage → Clear all

**Q: Do charts update automatically?**
A: Yes! Every 5 seconds. No manual refresh needed.

**Q: Why same emotion detected twice only saves once?**
A: Smart deduplication prevents saving identical data twice in a row.

**Q: Can I change the mood score formula?**
A: Yes, edit the `calculateMoodScore()` function in `emotionStorage.js`

---

## 🎉 You're Ready!

1. ✅ Start camera on Dashboard
2. ✅ Show different emotions
3. ✅ Go to Mood Tracker
4. ✅ Watch real charts populate
5. ✅ See AI-generated insights

**Enjoy your real-time emotion tracking! 📊✨**

---

## 📞 Troubleshooting

**Charts show "No Data"?**
→ Start camera detection first to collect emotions

**Data disappeared?**
→ Check if browser cache was cleared

**Charts not updating?**
→ Make sure emotions are being detected (check Dashboard)

**Performance slow?**
→ Try reducing refresh interval or clearing old data

For detailed technical information, see: `MOOD_TRACKER_UPGRADE_GUIDE.md`
