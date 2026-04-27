/**
 * Emotion Data Storage & Management Utility
 * Handles localStorage persistence and backend API calls
 * Prevents duplicate entries every second (stores every 5 sec or meaningful change)
 */

const API_BASE = "http://127.0.0.1:8000/api";
const STORAGE_KEY = "emotionDetectionData";
const LAST_EMOTION_KEY = "lastDetectedEmotion";
const MIN_CONFIDENCE_CHANGE = 5; // Min % change to trigger new entry
const MIN_TIME_BETWEEN_ENTRIES = 5000; // 5 seconds in milliseconds

// ==========================================
// STORAGE FUNCTIONS
// ==========================================

/**
 * Get all emotion data from localStorage
 * @returns {Array} Array of emotion entries
 */
export const getAllEmotionData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading emotion data:", error);
    return [];
  }
};

/**
 * Save emotion entry to localStorage
 * Implements deduplication logic to prevent duplicate entries
 * @param {Object} emotionData - { emotion, confidence, timestamp, date, allScores }
 * @returns {Boolean} True if saved, false if skipped (duplicate)
 */
export const saveEmotionData = (emotionData) => {
  try {
    const allData = getAllEmotionData();
    const now = Date.now();
    
    // Get last stored emotion
    const lastEmotion = localStorage.getItem(LAST_EMOTION_KEY);
    let lastData = null;
    try {
      lastData = lastEmotion ? JSON.parse(lastEmotion) : null;
    } catch {
      lastData = null;
    }

    // Deduplication logic
    if (lastData) {
      const timeDiff = now - (lastData.timestamp || 0);
      const confidenceDiff = Math.abs(
        (emotionData.confidence || 0) - (lastData.confidence || 0)
      );

      // Skip if: too soon AND (same emotion OR confidence change < threshold)
      if (
        timeDiff < MIN_TIME_BETWEEN_ENTRIES &&
        (emotionData.emotion === lastData.emotion ||
          confidenceDiff < MIN_CONFIDENCE_CHANGE)
      ) {
        return false; // Duplicate, skip
      }
    }

    // Create new entry with proper structure
    const newEntry = {
      date: emotionData.date || new Date().toLocaleDateString("en-CA"),
      time: emotionData.time || new Date().toLocaleTimeString(),
      timestamp: emotionData.timestamp || now,
      dominantEmotion: emotionData.emotion || "neutral",
      confidence: emotionData.confidence || 0,
      allEmotionScores: emotionData.allScores || {},
    };

    // Add to array and save
    allData.push(newEntry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
    localStorage.setItem(LAST_EMOTION_KEY, JSON.stringify(newEntry));

    return true; // Successfully saved
  } catch (error) {
    console.error("Error saving emotion data:", error);
    return false;
  }
};

/**
 * Get emotion data for a specific date
 * @param {String} date - Date in format YYYY-MM-DD
 * @returns {Array} Emotion entries for that date
 */
export const getEmotionsByDate = (date) => {
  const allData = getAllEmotionData();
  return allData.filter((entry) => entry.date === date);
};

/**
 * Get emotion data for last N days
 * @param {Number} days - Number of days to retrieve
 * @returns {Array} Emotion entries from last N days
 */
export const getEmotionsByDays = (days = 7) => {
  const allData = getAllEmotionData();
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - days);

  return allData.filter((entry) => {
    const entryDate = new Date(entry.date);
    return entryDate >= pastDate;
  });
};

/**
 * Get today's emotions
 * @returns {Array} Emotion entries from today
 */
export const getTodayEmotions = () => {
  const today = new Date().toLocaleDateString("en-CA");
  return getEmotionsByDate(today);
};

/**
 * Clear all emotion data
 */
export const clearEmotionData = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LAST_EMOTION_KEY);
};

// ==========================================
// CALCULATION FUNCTIONS
// ==========================================

/**
 * Get latest detected emotion
 * @returns {Object} Latest emotion entry or null
 */
export const getLatestEmotion = () => {
  const allData = getAllEmotionData();
  return allData.length > 0 ? allData[allData.length - 1] : null;
};

/**
 * Get emotion count distribution for a period
 * @param {Array} emotionData - Array of emotion entries
 * @returns {Object} Count of each emotion
 */
export const getEmotionDistribution = (emotionData) => {
  const distribution = {
    happy: 0,
    sad: 0,
    angry: 0,
    neutral: 0,
    surprise: 0,
    fear: 0,
    disgust: 0,
  };

  emotionData.forEach((entry) => {
    const emotion = entry.dominantEmotion.toLowerCase();
    if (distribution.hasOwnProperty(emotion)) {
      distribution[emotion]++;
    }
  });

  return distribution;
};

/**
 * Convert emotion distribution to percentage
 * @param {Object} distribution - Emotion count object
 * @returns {Array} Array suitable for Pie chart
 */
export const getDistributionPercentages = (distribution) => {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);
  if (total === 0) return [];

  const emotionColors = {
    happy: "#22c55e",
    sad: "#3b82f6",
    angry: "#ef4444",
    neutral: "#facc15",
    surprise: "#a855f7",
    fear: "#f97316",
    disgust: "#8b5cf6",
  };

  return Object.entries(distribution)
    .map(([emotion, count]) => ({
      name: emotion.charAt(0).toUpperCase() + emotion.slice(1),
      value: Math.round((count / total) * 100),
      color: emotionColors[emotion],
      count: count,
    }))
    .filter((item) => item.count > 0);
};

/**
 * Calculate daily mood score using weighted formula:
 * MoodScore = (Happy * 1.0) + (Surprise * 0.8) + (Neutral * 0.5) 
 *             - (Sad * 1.0) - (Angry * 0.9) - (Fear * 0.8) - (Disgust * 0.7)
 * Normalized to 0-100
 * @param {Object} distribution - Emotion distribution object (counts)
 * @returns {Number} Mood score 0-100
 */
export const calculateMoodScore = (distribution) => {
  if (Object.values(distribution).reduce((a, b) => a + b, 0) === 0) {
    return 50; // Neutral if no data
  }

  // ✅ NEW WEIGHTED FORMULA
  const positiveScore = 
    (distribution.happy || 0) * 1.0 +
    (distribution.surprise || 0) * 0.8 +
    (distribution.neutral || 0) * 0.5;
  
  const negativeScore = 
    (distribution.sad || 0) * 1.0 +
    (distribution.angry || 0) * 0.9 +
    (distribution.fear || 0) * 0.8 +
    (distribution.disgust || 0) * 0.7;

  let score = positiveScore - negativeScore;

  // Normalize to 0-100
  // Scale to realistic range (assume max positive ~5, max negative ~4)
  score = ((score + 4) / 9) * 100;
  
  // Clamp between 0 and 100
  score = Math.max(0, Math.min(100, score));

  return Math.round(score);
};

/**
 * Get average confidence for period
 * @param {Array} emotionData - Array of emotion entries
 * @returns {Number} Average confidence percentage
 */
export const getAverageConfidence = (emotionData) => {
  if (emotionData.length === 0) return 0;
  const sum = emotionData.reduce((acc, entry) => acc + (entry.confidence || 0), 0);
  return Math.round(sum / emotionData.length);
};

/**
 * Get daily mood scores for last 7 days
 * @returns {Array} Array with day and score for chart
 */
export const getDailyMoodScores = () => {
  const last7Days = getEmotionsByDays(7);
  const today = new Date();
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayMap = {};

  // Group by date
  last7Days.forEach((entry) => {
    if (!dayMap[entry.date]) {
      dayMap[entry.date] = [];
    }
    dayMap[entry.date].push(entry);
  });

  // Calculate score for each day
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - i);
    const dateStr = targetDate.toLocaleDateString("en-CA");
    const dayName = daysOfWeek[targetDate.getDay()];

    const dayEmotions = dayMap[dateStr] || [];
    const distribution = getEmotionDistribution(dayEmotions);
    const score = calculateMoodScore(distribution);

    result.push({
      day: dayName,
      score,
      date: dateStr,
    });
  }

  return result;
};

/**
 * Get weekly mood trend (average confidence per day) - ROUNDED VALUES
 * @returns {Array} Array with day and average confidence (rounded integers)
 */
export const getWeeklyMoodTrend = () => {
  const last7Days = getEmotionsByDays(7);
  const today = new Date();
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayMap = {};

  // Group by date
  last7Days.forEach((entry) => {
    if (!dayMap[entry.date]) {
      dayMap[entry.date] = [];
    }
    dayMap[entry.date].push(entry);
  });

  // Calculate average confidence for each day - ✅ ROUNDED
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - i);
    const dateStr = targetDate.toLocaleDateString("en-CA");
    const dayName = daysOfWeek[targetDate.getDay()];

    const dayEmotions = dayMap[dateStr] || [];
    const avgConfidence = getAverageConfidence(dayEmotions);

    result.push({
      day: dayName,
      intensity: Math.round(avgConfidence), // ✅ ROUND TO INTEGER
      date: dateStr,
    });
  }

  return result;
};

/**
 * Get today's mood intensity over time (for line chart) - ROUNDED VALUES
 * Uses timestamps to plot confidence throughout the day
 * @returns {Array} Array with time and confidence for chart
 */
export const getTodayMoodIntensity = () => {
  const today = getTodayEmotions();
  
  if (today.length === 0) {
    return [];
  }

  return today.map((entry, index) => ({
    time: entry.time || new Date(entry.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    intensity: Math.round(entry.confidence || 0), // ✅ ROUND TO INTEGER
    emotion: entry.dominantEmotion,
    timestamp: entry.timestamp,
  }));
};

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const getRewardStateKey = () => {
  const username = localStorage.getItem('loggedUser') || 'guest';
  return `emotionRewardsState_${username}`;
};

export const getStartOfCurrentWeek = (date = new Date()) => {
  const current = new Date(date);
  current.setHours(0, 0, 0, 0);
  const day = current.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  current.setDate(current.getDate() + offset);
  return current;
};

export const getCurrentWeekDates = () => {
  const today = new Date();
  const startOfWeek = getStartOfCurrentWeek(today);
  const result = [];
  const cursor = new Date(startOfWeek);

  while (cursor <= today) {
    result.push(cursor.toLocaleDateString('en-CA'));
    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
};

export const getCurrentWeekEntries = () => {
  const dates = getCurrentWeekDates();
  const allData = getAllEmotionData();
  return allData.filter((entry) => dates.includes(entry.date));
};

export const getDailySummaryForCurrentWeek = () => {
  return getCurrentWeekDates().map((dateStr) => {
    const entries = getEmotionsByDate(dateStr);
    const distribution = getEmotionDistribution(entries);
    const totalCount = entries.length;
    const averageConfidence = getAverageConfidence(entries);
    const averageMood = totalCount ? calculateMoodScore(distribution) : 0;
    const positiveCount = (distribution.happy || 0) + (distribution.surprise || 0) + (distribution.neutral || 0);
    const negativeCount = (distribution.sad || 0) + (distribution.angry || 0) + (distribution.fear || 0) + (distribution.disgust || 0);
    const positivity = totalCount ? Math.round((positiveCount / totalCount) * 100) : 0;
    const positiveMoodScore = totalCount ? Math.round((positiveCount / totalCount) * 100) : 0;
    const negativeMoodScore = totalCount ? Math.round((negativeCount / totalCount) * 100) : 0;
    const happiness = totalCount ? Math.round(((distribution.happy || 0) / totalCount) * 100) : 0;
    const stress = totalCount ? Math.round((negativeCount / totalCount) * 100) : 0;

    return {
      date: dateStr,
      day: DAYS_OF_WEEK[new Date(dateStr).getDay()],
      entries,
      totalCount,
      averageConfidence,
      averageMood,
      positivity,
      positiveMoodScore,
      negativeMoodScore,
      happiness,
      stress,
      productivity: averageMood,
      distribution,
    };
  });
};

export const getPositiveStreakDays = () => {
  const dailySummary = getDailySummaryForCurrentWeek();
  let streak = 0;

  for (const day of dailySummary) {
    if (day.totalCount > 0 && day.averageMood >= 60) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
};

export const getRewardStorage = () => {
  const key = getRewardStateKey();
  const stored = localStorage.getItem(key);

  if (!stored) {
    const initial = {
      chatbotUses: 0,
      tasksCompleted: 0,
      claimedRewards: [],
    };
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }

  try {
    return JSON.parse(stored);
  } catch (error) {
    const fallback = {
      chatbotUses: 0,
      tasksCompleted: 0,
      claimedRewards: [],
    };
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
};

export const saveRewardStorage = (state) => {
  const key = getRewardStateKey();
  const sanitized = {
    chatbotUses: state.chatbotUses || 0,
    tasksCompleted: state.tasksCompleted || 0,
    claimedRewards: Array.isArray(state.claimedRewards) ? state.claimedRewards : [],
  };
  localStorage.setItem(key, JSON.stringify(sanitized));
  return sanitized;
};

export const incrementChatbotUses = () => {
  const state = getRewardStorage();
  const updated = { ...state, chatbotUses: (state.chatbotUses || 0) + 1 };
  saveRewardStorage(updated);
  return updated;
};

export const incrementTasksCompleted = () => {
  const state = getRewardStorage();
  const updated = { ...state, tasksCompleted: (state.tasksCompleted || 0) + 1 };
  saveRewardStorage(updated);
  return updated;
};

export const claimReward = (rewardId) => {
  const state = getRewardStorage();
  if (!state.claimedRewards.includes(rewardId)) {
    const updated = { ...state, claimedRewards: [...state.claimedRewards, rewardId] };
    saveRewardStorage(updated);
    return updated;
  }
  return state;
};

export const getSuccessRate = (emotionData = []) => {
  const totalEntries = emotionData.length;
  if (totalEntries === 0) return 0;

  const rewardState = getRewardStorage();
  const happyEntries = emotionData.filter((entry) => entry.dominantEmotion === 'happy').length;
  const neutralProductiveEntries = emotionData.filter((entry) => entry.dominantEmotion === 'neutral').length;
  const completedRewards = rewardState.claimedRewards.length;
  const positiveStreak = getPositiveStreakDays();

  const score = ((happyEntries + neutralProductiveEntries + completedRewards + positiveStreak) / totalEntries) * 100;
  return Math.min(100, Math.round(score));
};

export const getWeeklyReportData = () => {
  const dailySummary = getDailySummaryForCurrentWeek();
  const weekEntries = dailySummary.reduce((acc, day) => acc.concat(day.entries), []);
  const totalEntries = weekEntries.length;
  const daysWithData = dailySummary.filter((day) => day.totalCount > 0);
  const weeklyAverageMood = daysWithData.length
    ? Math.round(daysWithData.reduce((sum, day) => sum + day.averageMood, 0) / daysWithData.length)
    : 0;
  const distribution = getEmotionDistribution(weekEntries);
  const mostFrequent = Object.entries(distribution).reduce(
    (best, [emotion, count]) => {
      if (count > best.count) {
        return { emotion, count };
      }
      return best;
    },
    { emotion: 'None', count: 0 }
  );
  const mostFrequentEmotion = {
    emotion: mostFrequent.emotion === 'None' ? 'No Data' : mostFrequent.emotion.charAt(0).toUpperCase() + mostFrequent.emotion.slice(1),
    count: mostFrequent.count,
    percentage: totalEntries ? Math.round((mostFrequent.count / totalEntries) * 100) : 0,
  };

  const bestDayData = daysWithData.reduce(
    (best, day) => {
      if (day.averageMood > best.averageMood) return day;
      return best;
    },
    { day: 'No Data', averageMood: 0, totalCount: 0 }
  );

  const report = {
    dailyBreakdown: dailySummary,
    totalEntries,
    weeklyAverageMood,
    mostFrequentEmotion,
    bestDay: {
      day: bestDayData.day,
      score: bestDayData.averageMood,
      reason: bestDayData.totalCount > 0 ? `Highest mood score of ${bestDayData.averageMood}%` : 'No mood entries yet',
    },
    successRate: getSuccessRate(weekEntries),
    positiveStreakDays: getPositiveStreakDays(),
    insights: [
      bestDayData.totalCount > 0
        ? `Best day was ${bestDayData.day} with an average mood score of ${bestDayData.averageMood}%.`
        : 'No mood entries found for this week.',
      mostFrequentEmotion.count > 0
        ? `Most frequent emotion this week was ${mostFrequentEmotion.emotion} at ${mostFrequentEmotion.percentage}%.`
        : 'Track more emotions to get better insights.',
      `Weekly average mood is ${weeklyAverageMood}% across ${daysWithData.length} day(s) of actual data.`,
      totalEntries
        ? `You logged ${totalEntries} emotion captures this week.`
        : 'Start tracking your emotions to populate your weekly report.',
    ],
  };

  return report;
};

export const getTomorrowMoodPrediction = () => {
  const dailySummary = getDailySummaryForCurrentWeek();
  const entries = dailySummary.reduce((acc, day) => acc.concat(day.entries), []);
  if (entries.length === 0) {
    return {
      mood: 'Neutral',
      moodValue: 50,
      confidence: 60,
      reason: 'Add emotion captures from the dashboard to improve predictions.',
      trend: 'stable',
      forecast: [],
      tomorrowDay: 'Tomorrow',
    };
  }

  const validDays = dailySummary.filter((day) => day.totalCount > 0);
  const latestEntry = getLatestEmotion();
  const latestScore = latestEntry
    ? calculateMoodScore(getEmotionDistribution([latestEntry]))
    : null;

  const last7AverageMood = validDays.length
    ? Math.round(validDays.reduce((sum, day) => sum + day.averageMood, 0) / validDays.length)
    : 50;
  const lastThreeDays = validDays.slice(-3);
  const firstThreeDays = validDays.slice(0, 3);

  const recentConfidence = lastThreeDays.length
    ? Math.round(lastThreeDays.reduce((sum, day) => sum + day.averageConfidence, 0) / lastThreeDays.length)
    : last7AverageMood;
  const earlierConfidence = firstThreeDays.length
    ? Math.round(firstThreeDays.reduce((sum, day) => sum + day.averageConfidence, 0) / firstThreeDays.length)
    : recentConfidence;
  const confidenceTrendDelta = recentConfidence - earlierConfidence;

  const recentPositivity = lastThreeDays.length
    ? Math.round(lastThreeDays.reduce((sum, day) => sum + day.positivity, 0) / lastThreeDays.length)
    : 0;
  const earlierPositivity = firstThreeDays.length
    ? Math.round(firstThreeDays.reduce((sum, day) => sum + day.positivity, 0) / firstThreeDays.length)
    : recentPositivity;
  const positivityDelta = recentPositivity - earlierPositivity;

  const recentMoodAverage = lastThreeDays.length
    ? Math.round(lastThreeDays.reduce((sum, day) => sum + day.averageMood, 0) / lastThreeDays.length)
    : last7AverageMood;
  const earlierMoodAverage = firstThreeDays.length
    ? Math.round(firstThreeDays.reduce((sum, day) => sum + day.averageMood, 0) / firstThreeDays.length)
    : last7AverageMood;
  const trendDelta = recentMoodAverage - earlierMoodAverage;
  const trend = trendDelta >= 5 ? 'improving' : trendDelta <= -5 ? 'declining' : 'stable';

  const emotionDistribution = getEmotionDistribution(entries);
  const dominantEmotion = Object.entries(emotionDistribution).reduce(
    (best, [emotion, count]) => (count > best.count ? { emotion, count } : best),
    { emotion: 'neutral', count: 0 }
  ).emotion;

  const dominantMood = dominantEmotion === 'happy'
    ? 'Happy'
    : ['sad', 'angry', 'fear', 'disgust'].includes(dominantEmotion)
      ? 'Sad'
      : 'Neutral';

  const basePrediction = Math.round(
    last7AverageMood * 0.4 +
    (latestScore !== null ? latestScore : last7AverageMood) * 0.35 +
    recentMoodAverage * 0.15 +
    trendDelta * 0.6 +
    confidenceTrendDelta * 0.3 +
    positivityDelta * 0.2
  );

  const predictedMoodValue = Math.max(0, Math.min(100, basePrediction));
  let confidence = Math.round(
    Math.min(98, Math.max(55, 55 + predictedMoodValue * 0.28 + recentConfidence * 0.18 + (dominantMood === 'Happy' ? 5 : dominantMood === 'Sad' ? -5 : 0)))
  );

  const predictedLabel = predictedMoodValue >= 75
    ? 'Happy'
    : predictedMoodValue >= 55
      ? 'Neutral'
      : 'Sad';

  const confidenceMomentum = confidenceTrendDelta >= 0 ? 'increasing' : 'decreasing';
  const positivityDirection = positivityDelta >= 0 ? 'higher' : 'lower';

  const reasonParts = [
    `Latest detection shows ${latestEntry?.dominantEmotion || 'neutral'} mood.`,
    `Your mood trend is ${trend}.`,
    `Confidence momentum is ${confidenceMomentum} by ${Math.abs(confidenceTrendDelta)}%.`,
    `Positive emotion share is ${positivityDirection} compared to earlier this week.`,
    `Dominant emotion is ${dominantEmotion}.`,
  ];

  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowDayName = DAYS_OF_WEEK[tomorrowDate.getDay()];

  return {
    mood: predictedLabel,
    moodValue: predictedMoodValue,
    confidence,
    reason: reasonParts.join(' '),
    trend,
    forecast: dailySummary.map((day) => ({
      day: day.day,
      mood: day.averageMood,
      confidence: day.averageConfidence,
    })),
    tomorrowDay: tomorrowDayName,
  };
};

export const getCurrentWeekForecast = () => {
  const prediction = getTomorrowMoodPrediction();
  const forecast = prediction.forecast.slice();
  const tomorrowDay = new Date();
  tomorrowDay.setDate(tomorrowDay.getDate() + 1);
  forecast.push({
    day: DAYS_OF_WEEK[tomorrowDay.getDay()],
    mood: prediction.confidence,
    confidence: prediction.confidence,
  });
  return forecast;
};

/**
 * Get emoji for emotion
 * @param {String} emotion - Emotion name
 * @returns {String} Emoji
 */
export const getEmotionEmoji = (emotion) => {
  const emojis = {
    happy: "😊",
    sad: "😢",
    angry: "😠",
    neutral: "😐",
    surprise: "😮",
    fear: "😨",
    disgust: "🤢",
  };
  return emojis[emotion?.toLowerCase()] || "😐";
};

/**
 * Get color for emotion
 * @param {String} emotion - Emotion name
 * @returns {String} Color hex code
 */
export const getEmotionColor = (emotion) => {
  const colors = {
    happy: "#22c55e",
    sad: "#3b82f6",
    angry: "#ef4444",
    neutral: "#facc15",
    surprise: "#a855f7",
    fear: "#f97316",
    disgust: "#8b5cf6",
  };
  return colors[emotion?.toLowerCase()] || "#00c6ff";
};

// ==========================================
// BACKEND API FUNCTIONS
// ==========================================

/**
 * Fetch emotion data from backend API
 * @param {String} username - Username
 * @returns {Promise<Array>} Emotion entries from backend
 */
export const fetchEmotionDataFromAPI = async (username) => {
  try {
    const response = await fetch(
      `${API_BASE}/history/?username=${username}`
    );
    if (!response.ok) throw new Error("Failed to fetch emotion history");
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching emotion data from API:", error);
    return [];
  }
};

/**
 * Save emotion data to backend API
 * @param {String} username - Username
 * @param {Object} emotionData - Emotion entry
 * @returns {Promise<Boolean>} Success status
 */
export const saveEmotionDataToAPI = async (username, emotionData) => {
  try {
    const response = await fetch(`${API_BASE}/emotion/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        emotion: emotionData.dominantEmotion,
        confidence: emotionData.confidence,
        timestamp: emotionData.timestamp,
      }),
    });
    return response.ok;
  } catch (error) {
    console.error("Error saving emotion data to API:", error);
    return false;
  }
};

/**
 * Sync localStorage data to backend
 * @param {String} username - Username
 * @returns {Promise<Boolean>} Success status
 */
export const syncDataToBackend = async (username) => {
  try {
    const allData = getAllEmotionData();
    for (const entry of allData) {
      await saveEmotionDataToAPI(username, entry);
    }
    return true;
  } catch (error) {
    console.error("Error syncing data to backend:", error);
    return false;
  }
};
