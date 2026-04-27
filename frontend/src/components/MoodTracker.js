import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

import {
  getTodayEmotions,
  getTodayMoodIntensity,
  getEmotionDistribution,
  getDistributionPercentages,
  getWeeklyMoodTrend,
  getLatestEmotion,
  getEmotionEmoji,
} from "../utils/emotionStorage";

import "./MoodTracker.css";

const MoodTracker = () => {
  const navigate = useNavigate();

  const [currentMood, setCurrentMood] = useState({
    emoji: "😐",
    name: "Neutral",
    score: 50,
  });

  const [todayIntensityData, setTodayIntensityData] = useState([]);
  const [weeklyTrendData, setWeeklyTrendData] = useState([]);
  const [moodDistributionData, setMoodDistributionData] = useState([]);
  const [weeklyInsights, setWeeklyInsights] = useState([]);

  // ========================================
  // LOAD DATA
  // ========================================
  useEffect(() => {
    const loadEmotionData = async () => {
      try {
        const todayData = getTodayEmotions();

        // Today's Mood - Use same logic as Dashboard
        if (todayData.length > 0) {
          const latest = todayData[todayData.length - 1];
          setCurrentMood({
            emoji: getEmotionEmoji(latest.dominantEmotion),
            name:
              latest.dominantEmotion.charAt(0).toUpperCase() +
              latest.dominantEmotion.slice(1),
            score: Math.round(latest.confidence || 0),
          });
        } else {
          setCurrentMood({
            emoji: "😐",
            name: "No Data",
            score: 0,
          });
        }

        // Today's Intensity Chart
        const todayIntensity = getTodayMoodIntensity();

        setTodayIntensityData(
          todayIntensity.length > 0
            ? todayIntensity
            : [{ time: "No Data", intensity: 0 }]
        );

        // Weekly Trend Blocks - Fixed to show only days with data from Monday
        const weeklyTrend = getWeeklyMoodTrend();
        setWeeklyTrendData(
          weeklyTrend.length > 0
            ? weeklyTrend.filter(item => item.intensity > 0) // Only show days with data
            : [{ day: "No Data", intensity: 0 }]
        );

        // Mood Distribution
        const distribution = getEmotionDistribution(todayData);
        const distributionChart = getDistributionPercentages(distribution);

        setMoodDistributionData(
          distributionChart.length > 0
            ? distributionChart
            : [{ name: "No Data", value: 100, color: "#6b7280" }]
        );

        // Weekly insights from backend DB
        const response = await fetch(
          `http://127.0.0.1:8000/api/weekly-report/?username=${localStorage.getItem("loggedUser")}`
        );
        if (response.ok) {
          const report = await response.json();
          generateInsights(report, distribution);
        } else {
          generateInsights(null, distribution);
        }
      } catch (error) {
        console.error("Error loading emotion data:", error);
      }
    };

    loadEmotionData();

    const interval = setInterval(loadEmotionData, 2000); // Real-time every 2 seconds

    return () => clearInterval(interval);
  }, []);

  // ========================================
  // INSIGHTS
  // ========================================
  const generateInsights = (report, distribution) => {
    const insights = [];

    if (report && report.bestDay && report.bestDay.score > 0) {
      insights.push(
        `Best mood day: ${report.bestDay.day} (${report.bestDay.score}%)`
      );
    }

    if (report && report.mostFrequentEmotion && report.mostFrequentEmotion.count > 0) {
      insights.push(
        `Most frequent emotion: ${report.mostFrequentEmotion.emotion} (${report.mostFrequentEmotion.percentage}%)`
      );
    }

    if (report && typeof report.weeklyAverageMood === 'number') {
      insights.push(
        `Weekly average mood: ${report.weeklyAverageMood}%`
      );
    }

    if (!report || insights.length === 0) {
      const total = Object.values(distribution).reduce((a, b) => a + b, 0);
      if (total > 0) {
        const topEmotion = Object.entries(distribution).reduce((a, b) =>
          a[1] > b[1] ? a : b
        );

        insights.push(
          `Most frequent emotion: ${topEmotion[0]} (${Math.round(
            (topEmotion[1] / total) * 100
          )}%)`
        );
      } else {
        insights.push("Start live detection to see mood insights.");
      }
    }

    setWeeklyInsights(insights);
  };

  // ========================================
  // TIPS
  // ========================================
  const getPersonalizedTips = (mood) => {
    const tips = {
      happy: [
        "Use this energy productively",
        "Share positivity with friends",
        "Celebrate your progress",
      ],
      sad: [
        "Take a short walk",
        "Talk with someone you trust",
        "Listen to calming music",
      ],
      angry: [
        "Take deep breaths",
        "Pause before reacting",
        "Try stretching",
      ],
      neutral: [
        "Good time for focused work",
        "Plan your next goal",
        "Stay hydrated",
      ],
    };

    return tips[mood.toLowerCase()] || tips.neutral;
  };

  // ========================================
  // JSX
  // ========================================
  return (
    <div className="mood-tracker-container">

      {/* Header */}
      <div className="mood-header">
        <h1>Mood Tracker</h1>
      </div>

      {/* Today's Mood */}
      <div className="mood-card today-mood">
        <h3>Today's Mood</h3>

        <div className="mood-display">
          <div className="mood-emoji">{currentMood.emoji}</div>

          <div>
            <h4>{currentMood.name}</h4>
            <div className="mood-score">{currentMood.score}%</div>
          </div>
        </div>
      </div>

      {/* Weekly Trend */}
      <div className="mood-card">
        <h3>Weekly Mood Trend</h3>

        <div className="weekly-cards">
          {weeklyTrendData.map((item, index) => (
            <div className="day-card" key={index}>
              <div>{item.day}</div>
              <div>{Math.round(item.intensity)}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="charts-section">

        {/* Line */}
        <div className="chart-card">
          <h3>Mood Intensity Over Time</h3>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={todayIntensityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="intensity"
                stroke="#00c6ff"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie */}
        <div className="chart-card">
          <h3>Mood Distribution</h3>

          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={moodDistributionData}
                dataKey="value"
                outerRadius={80}
                label
              >
                {moodDistributionData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Insights */}
      <div className="mood-card">
        <h3>Weekly Insights</h3>

        {weeklyInsights.map((item, index) => (
          <div key={index}>{item}</div>
        ))}
      </div>

      {/* Tips */}
      <div className="mood-card">
        <h3>Tips for {currentMood.name}</h3>

        {getPersonalizedTips(currentMood.name).map((tip, index) => (
          <div key={index}>{tip}</div>
        ))}
      </div>

      {/* Back */}
      <button
        className="nav-btn"
        onClick={() => navigate("/dashboard")}
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default MoodTracker;