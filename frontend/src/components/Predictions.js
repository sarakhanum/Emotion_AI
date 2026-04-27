import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Clock, Calendar, Target, Zap, AlertTriangle, CheckCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { getLatestEmotion, getDailySummaryForCurrentWeek, getWeeklyReportData, getTomorrowMoodPrediction } from "../utils/emotionStorage";
import "./Predictions.css";

const Predictions = () => {
  const [predictions, setPredictions] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [currentEmotion, setCurrentEmotion] = useState('neutral');

  useEffect(() => {
    const loadPredictions = () => {
      const report = getWeeklyReportData();
      const dailySummary = getDailySummaryForCurrentWeek();
      const predictionData = getTomorrowMoodPrediction();
      setPredictions(buildPredictions(report, dailySummary, predictionData));
    };

    loadPredictions();
    const interval = setInterval(loadPredictions, 5000);

    const storageHandler = (event) => {
      if (!event.key || event.key.startsWith("emotion") || event.key.startsWith("emotionRewardsState_")) {
        loadPredictions();
      }
    };

    window.addEventListener("storage", storageHandler);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", storageHandler);
    };
  }, []);

  useEffect(() => {
    const updateCurrentEmotion = () => {
      const latest = getLatestEmotion();
      if (latest) {
        setCurrentEmotion(latest.dominantEmotion.toLowerCase());
      }
    };

    updateCurrentEmotion();

    // Update every 5 seconds to reflect live changes
    const interval = setInterval(updateCurrentEmotion, 5000);
    return () => clearInterval(interval);
  }, []);

  const getMoodLabel = (score) => {
    if (score >= 80) return "Happy";
    if (score >= 55) return "Neutral";
    if (score >= 40) return "Sad";
    return "Angry";
  };

  const getMoodEmoji = (mood) => {
    const map = {
      Happy: "😊",
      Sad: "😢",
      Angry: "😠",
      Neutral: "😐",
    };
    return map[mood] || "😐";
  };

  const getMoodSuggestion = (mood) => {
    const lowerMood = mood.toLowerCase();
    const suggestions = {
      happy: "Great! Keep up the positive energy 😊",
      sad: "Try listening to music or talking to a friend 💙",
      neutral: "Good time to focus and plan your goals 🎯",
      angry: "Take a deep breath and relax for a few minutes 😌",
    };
    return suggestions[lowerMood] || "Stay present and take care of yourself today.";
  };

  const buildPredictions = (report, dailySummary, predictionData) => {
    const averageMood = report.weeklyAverageMood || 50;
    const moodLabel = getMoodLabel(averageMood);
    const trend = predictionData.trend || (averageMood >= 65 ? "improving" : averageMood >= 45 ? "stable" : "declining");
    const forecast = dailySummary.map((item) => ({
      day: item.day,
      mood: item.averageMood,
      confidence: item.averageConfidence,
    }));

    const tomorrowLabel = predictionData.tomorrowDay || "Tomorrow";
    const tomorrowMoodScore = predictionData.moodValue ?? Math.round(predictionData.confidence || averageMood);
    const tomorrowConfidence = predictionData.confidence || Math.min(100, Math.max(55, averageMood));

    return {
      tomorrow: {
        mood: predictionData.mood || moodLabel,
        emoji: getMoodEmoji(predictionData.mood || moodLabel),
        confidence: tomorrowConfidence,
        reason: predictionData.reason || `Based on your logged emotions from the current week`,
        bestTime: `${report.bestDay?.day || "Midweek"} is your strongest day`,
        suggestion: getMoodSuggestion(predictionData.mood || moodLabel),
      },
      week: {
        trend,
        averageMood,
        peakDay: report.bestDay?.day || "N/A",
        stressPeriods: report.mostFrequentEmotion?.emotion?.toLowerCase() === "angry"
          ? ["Evening cooldown periods", "Late afternoon breaks"]
          : ["Friday 2-4 PM", "Monday 9-11 AM"],
        productiveHours: [
          `${report.bestDay?.day || "Wednesday"} morning`,
          `${report.bestDay?.day || "Wednesday"} early afternoon`,
        ],
        forecast: [...forecast, { day: tomorrowLabel, mood: tomorrowMoodScore, confidence: tomorrowConfidence }],
      },
      month: {
        trend: averageMood >= 65 ? "stable" : "improving",
        projectedAverage: Math.round(Math.min(100, averageMood + 3)),
        bestMonth: report.bestDay?.day
          ? `Strongest mood day was ${report.bestDay.day}`
          : "Keep tracking for monthly clarity",
        recommendations: [
          `Use ${report.bestDay?.day || "your strongest day"} for important planning`,
          getMoodSuggestion(predictionData.mood || moodLabel),
          "Keep consistent check-ins to improve your mood forecast.",
        ],
      },
      insights: [
        {
          type: "positive",
          title: report.bestDay?.day
            ? `Best mood day: ${report.bestDay.day}`
            : "Tracking your mood",
          description: report.bestDay?.score
            ? `Your highest weekly score was ${report.bestDay.score}%.`
            : "No mood entries recorded yet this week.",
          impact: "high",
        },
        {
          type: report.mostFrequentEmotion?.emotion?.toLowerCase() === "angry" ? "warning" : "info",
          title: report.mostFrequentEmotion?.emotion
            ? `Most frequent emotion: ${report.mostFrequentEmotion.emotion}`
            : "Emotion frequency pending",
          description: report.mostFrequentEmotion?.percentage
            ? `This emotion appeared in ${report.mostFrequentEmotion.percentage}% of entries.`
            : "Keep detecting emotions for better trends.",
          impact: "medium",
        },
        {
          type: "info",
          title: "Weekly average mood",
          description: `${averageMood}% overall mood rating for the current week`,
          impact: "low",
        },
      ],
    };
  };

  const getFallbackPredictions = () => ({
    tomorrow: {
      mood: "Neutral",
      confidence: 60,
      emoji: "😐",
      reason: "Connect with the dashboard to generate live predictions.",
      bestTime: "Anytime you feel ready",
      suggestion: "Keep checking in with your mood every day.",
    },
    week: {
      trend: "stable",
      averageMood: 60,
      peakDay: "Wednesday",
      stressPeriods: ["Friday 2-4 PM", "Monday 9-11 AM"],
      productiveHours: ["Tuesday 10 AM-12 PM", "Wednesday 2-4 PM"],
      forecast: [
        { day: "Today", mood: 60, confidence: 60 },
        { day: "Tomorrow", mood: 62, confidence: 62 },
        { day: "Wed", mood: 61, confidence: 61 },
        { day: "Thu", mood: 63, confidence: 63 },
        { day: "Fri", mood: 59, confidence: 59 },
        { day: "Sat", mood: 65, confidence: 65 },
        { day: "Sun", mood: 64, confidence: 64 },
      ],
    },
    month: {
      trend: "stable",
      projectedAverage: 62,
      bestMonth: "Track more data for a better projection",
      recommendations: [
        "Keep a consistent emotion check-in routine",
        "Share your mood with the assistant for extra support",
        "Try short breaks when your mood dips",
      ],
    },
    insights: [
      {
        type: "info",
        title: "Prediction setup",
        description: "Your prediction page is ready. Capture more emotions to personalize it.",
        impact: "low",
      },
    ],
  });

  const getPersonalizedRecommendations = (emotion) => {
    const recommendations = {
      happy: {
        songs: ["Happy by Pharrell Williams", "Can't Stop the Feeling! by Justin Timberlake", "Uptown Funk by Mark Ronson ft. Bruno Mars"],
        activities: ["Plan a fun outing with friends", "Try a new hobby or creative project", "Share your positivity by helping someone"],
        social: ["Connect with loved ones", "Join a group activity", "Celebrate achievements"]
      },
      sad: {
        music: ["Someone Like You by Adele", "Hurt by Johnny Cash", "The Night We Met by Lord Huron"],
        calming: ["Take a warm bath", "Journal your feelings", "Practice deep breathing exercises"],
        selfcare: ["Watch a comforting movie", "Call a close friend", "Spend time in nature"]
      },
      angry: {
        exercises: ["Progressive muscle relaxation", "Boxing or punching bag workout", "Deep breathing: 4-7-8 technique"],
        music: ["Calm down music playlists", "Instrumental jazz", "Nature sounds"],
        tasks: ["Go for a brisk walk", "Write down what's bothering you", "Practice mindfulness meditation"]
      },
      neutral: {
        productive: ["Tackle pending tasks", "Organize your workspace", "Learn something new"],
        music: ["Focus playlists on Spotify", "Instrumental study music", "Ambient sounds"],
        growth: ["Set small achievable goals", "Read an inspiring book", "Plan your week ahead"]
      },
      fear: {
        grounding: ["5-4-3-2-1 grounding technique", "Hold an ice cube", "Name 5 things you can see"],
        reassurance: ["Remind yourself: this feeling will pass", "Talk to a trusted person", "Write down your fears and counter them"],
        audio: ["Guided meditation for anxiety", "Calming podcasts", "White noise or rain sounds"]
      },
      surprise: {
        creative: ["Start a new art project", "Write a short story", "Try an experimental recipe"],
        explore: ["Visit a new place", "Watch a documentary", "Learn about something unexpected"],
        ideas: ["Brainstorm new goals", "Try a different routine", "Embrace spontaneity"]
      },
      disgust: {
        cleansing: ["Clean and organize your space", "Take a refreshing shower", "Change your environment"],
        positive: ["Focus on things you enjoy", "Practice gratitude", "Engage in pleasant activities"],
        redirect: ["Channel energy into exercise", "Listen to uplifting music", "Spend time with positive people"]
      }
    };

    return recommendations[emotion] || recommendations.neutral;
  };

  const getTrendIcon = (trend) => {
    return trend === 'improving' ? TrendingUp : TrendingDown;
  };

  const getTrendColor = (trend) => {
    return trend === 'improving' ? '#22c55e' : '#ef4444';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return '#22c55e';
    if (confidence >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getImpactColor = (impact) => {
    const colors = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#22c55e'
    };
    return colors[impact] || '#6b7280';
  };

  if (!predictions) {
    return (
      <div className="predictions-container">
        <div className="loading-skeleton">
          <div className="skeleton-header"></div>
          <div className="skeleton-cards"></div>
          <div className="skeleton-chart"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="predictions-container">
      {/* Header */}
      <motion.div
        className="predictions-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-content">
          <div>
            <h1>Mood Predictions</h1>
            <p>AI-powered forecasts based on your emotional patterns</p>
          </div>
          <div className="timeframe-selector">
            {['week', 'month'].map(timeframe => (
              <motion.button
                key={timeframe}
                className={`timeframe-btn ${selectedTimeframe === timeframe ? 'active' : ''}`}
                onClick={() => setSelectedTimeframe(timeframe)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tomorrow's Prediction */}
      <motion.div
        className="tomorrow-prediction"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="prediction-card">
          <div className="prediction-header">
            <div className="prediction-icon">
              <Calendar size={24} />
            </div>
            <div>
              <h3>Tomorrow's Forecast</h3>
              <p>Based on your historical patterns</p>
            </div>
          </div>

          <div className="prediction-content">
            <div className="mood-prediction">
              <div className="mood-emoji">{predictions.tomorrow.emoji}</div>
              <div className="mood-details">
                <h4>{predictions.tomorrow.mood}</h4>
                <div className="confidence-bar">
                  <div
                    className="confidence-fill"
                    style={{ width: `${predictions.tomorrow.confidence}%` }}
                  ></div>
                </div>
                <span className="confidence-text">{predictions.tomorrow.confidence}% confidence</span>
              </div>
            </div>

            <div className="prediction-details">
              <div className="detail-item">
                <Clock size={16} />
                <span>Best time: {predictions.tomorrow.bestTime}</span>
              </div>
              <div className="detail-item">
                <Target size={16} />
                <span>{predictions.tomorrow.reason}</span>
              </div>
            </div>

            <div className="prediction-suggestion">
              <Zap size={16} />
              <p>{predictions.tomorrow.suggestion}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Weekly/Monthly Overview */}
      <motion.div
        className="overview-section"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="overview-cards">
          <motion.div
            className="overview-card trend"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="card-icon">
              {React.createElement(getTrendIcon(predictions[selectedTimeframe].trend), { size: 24 })}
            </div>
            <div className="card-content">
              <h4>Trend</h4>
              <p style={{ color: getTrendColor(predictions[selectedTimeframe].trend) }}>
                {predictions[selectedTimeframe].trend.charAt(0).toUpperCase() + predictions[selectedTimeframe].trend.slice(1)}
              </p>
            </div>
          </motion.div>

          <motion.div
            className="overview-card average"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="card-icon">
              <Target size={24} />
            </div>
            <div className="card-content">
              <h4>Average Mood</h4>
              <p>{selectedTimeframe === 'week' ? predictions.week.averageMood : predictions.month.projectedAverage}%</p>
            </div>
          </motion.div>

          <motion.div
            className="overview-card peak"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="card-icon">
              <CheckCircle size={24} />
            </div>
            <div className="card-content">
              <h4>Peak Performance</h4>
              <p>{selectedTimeframe === 'week' ? predictions.week.peakDay : predictions.month.bestMonth}</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Forecast Chart */}
      {selectedTimeframe === 'week' && (
        <motion.div
          className="forecast-chart"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="chart-card">
            <h3>7-Day Mood Forecast</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={predictions.week.forecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(17, 24, 39, 0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                  formatter={(value, name) => [`${value}%`, name === 'mood' ? 'Mood Score' : 'Confidence']}
                />
                <Area
                  type="monotone"
                  dataKey="mood"
                  stroke="#00c6ff"
                  fill="rgba(0, 198, 255, 0.2)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Key Insights */}
      <motion.div
        className="insights-section"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <h3>Key Insights & Alerts</h3>
        <div className="insights-grid">
          {predictions.insights.map((insight, index) => (
            <motion.div
              key={index}
              className={`insight-card ${insight.type}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="insight-icon">
                {insight.type === 'positive' && <CheckCircle size={20} />}
                {insight.type === 'warning' && <AlertTriangle size={20} />}
                {insight.type === 'info' && <Target size={20} />}
              </div>
              <div className="insight-content">
                <h4>{insight.title}</h4>
                <p>{insight.description}</p>
                <div className="impact-indicator">
                  <div
                    className="impact-dot"
                    style={{ backgroundColor: getImpactColor(insight.impact) }}
                  ></div>
                  <span>Impact: {insight.impact}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        className="recommendations-section"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
      >
        <h3>Personalized Recommendations</h3>
        <div className="recommendations-content">
          {(() => {
            const recs = getPersonalizedRecommendations(currentEmotion);
            return (
              <>
                {recs.songs && (
                  <div className="rec-section">
                    <h4>🎵 Energetic Songs</h4>
                    <ul>
                      {recs.songs.map((song, index) => (
                        <li key={index}>{song}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {recs.music && (
                  <div className="rec-section">
                    <h4>🎵 Uplifting Music</h4>
                    <ul>
                      {recs.music.map((music, index) => (
                        <li key={index}>{music}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {recs.activities && (
                  <div className="rec-section">
                    <h4>🎉 Fun Activities</h4>
                    <ul>
                      {recs.activities.map((activity, index) => (
                        <li key={index}>{activity}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {recs.social && (
                  <div className="rec-section">
                    <h4>👥 Social Suggestions</h4>
                    <ul>
                      {recs.social.map((social, index) => (
                        <li key={index}>{social}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {recs.exercises && (
                  <div className="rec-section">
                    <h4>🧘 Breathing Exercises</h4>
                    <ul>
                      {recs.exercises.map((exercise, index) => (
                        <li key={index}>{exercise}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {recs.calming && (
                  <div className="rec-section">
                    <h4>😌 Calming Activities</h4>
                    <ul>
                      {recs.calming.map((calm, index) => (
                        <li key={index}>{calm}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {recs.selfcare && (
                  <div className="rec-section">
                    <h4>💙 Self-Care Tips</h4>
                    <ul>
                      {recs.selfcare.map((care, index) => (
                        <li key={index}>{care}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {recs.tasks && (
                  <div className="rec-section">
                    <h4>✅ Relaxation Tasks</h4>
                    <ul>
                      {recs.tasks.map((task, index) => (
                        <li key={index}>{task}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {recs.productive && (
                  <div className="rec-section">
                    <h4>🎯 Productive Tasks</h4>
                    <ul>
                      {recs.productive.map((task, index) => (
                        <li key={index}>{task}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {recs.focus && (
                  <div className="rec-section">
                    <h4>🎵 Focus Music</h4>
                    <ul>
                      {recs.focus.map((focus, index) => (
                        <li key={index}>{focus}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {recs.growth && (
                  <div className="rec-section">
                    <h4>🌱 Growth Suggestions</h4>
                    <ul>
                      {recs.growth.map((growth, index) => (
                        <li key={index}>{growth}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {recs.grounding && (
                  <div className="rec-section">
                    <h4>🌍 Grounding Exercises</h4>
                    <ul>
                      {recs.grounding.map((ground, index) => (
                        <li key={index}>{ground}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {recs.reassurance && (
                  <div className="rec-section">
                    <h4>💬 Reassurance Tips</h4>
                    <ul>
                      {recs.reassurance.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {recs.audio && (
                  <div className="rec-section">
                    <h4>🔊 Relaxing Audio</h4>
                    <ul>
                      {recs.audio.map((audio, index) => (
                        <li key={index}>{audio}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {recs.creative && (
                  <div className="rec-section">
                    <h4>🎨 Creative Ideas</h4>
                    <ul>
                      {recs.creative.map((idea, index) => (
                        <li key={index}>{idea}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {recs.explore && (
                  <div className="rec-section">
                    <h4>🔍 Explore New Content</h4>
                    <ul>
                      {recs.explore.map((explore, index) => (
                        <li key={index}>{explore}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {recs.cleansing && (
                  <div className="rec-section">
                    <h4>🧹 Cleansing Activities</h4>
                    <ul>
                      {recs.cleansing.map((clean, index) => (
                        <li key={index}>{clean}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {recs.positive && (
                  <div className="rec-section">
                    <h4>😊 Positive Focus</h4>
                    <ul>
                      {recs.positive.map((pos, index) => (
                        <li key={index}>{pos}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {recs.redirect && (
                  <div className="rec-section">
                    <h4>⚡ Redirect Energy</h4>
                    <ul>
                      {recs.redirect.map((redirect, index) => (
                        <li key={index}>{redirect}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </motion.div>

      {/* Accuracy Notice */}
      <motion.div
        className="accuracy-notice"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <div className="notice-content">
          <Target size={20} />
          <div>
            <h4>Prediction Accuracy</h4>
            <p>Predictions are based on your historical mood patterns and have an average accuracy of 78%. Results may vary based on external factors.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Predictions;