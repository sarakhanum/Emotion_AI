import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Zap, Target, Award, Crown, Flame, Shield, Heart, Sparkles } from "lucide-react";
import { getAllEmotionData, getDailySummaryForCurrentWeek, getRewardStorage, claimReward } from "../utils/emotionStorage";
import "./RewardsZone.css";

const rewardShopItems = [
  {
    id: 1,
    name: "Premium Themes",
    description: "Unlock exclusive dark themes",
    cost: 500,
    icon: "🎨",
    category: "appearance",
  },
  {
    id: 2,
    name: "Advanced Analytics",
    description: "Detailed mood pattern analysis",
    cost: 1000,
    icon: "📊",
    category: "features",
  },
  {
    id: 3,
    name: "Custom Soundtracks",
    description: "Personalized mood-based music",
    cost: 750,
    icon: "🎵",
    category: "entertainment",
  },
  {
    id: 4,
    name: "VIP Support",
    description: "Priority customer support",
    cost: 1500,
    icon: "👑",
    category: "premium",
  },
  {
    id: 5,
    name: "Export Pro",
    description: "Advanced data export options",
    cost: 600,
    icon: "📤",
    category: "features",
  },
  {
    id: 6,
    name: "Meditation Library",
    description: "Premium guided meditations",
    cost: 800,
    icon: "🧘",
    category: "wellness",
  },
];

const buildBadges = ({ totalSessions, streak, tasksCompleted, chatUses }) => [
  {
    id: 1,
    name: "First Detection",
    icon: "🌟",
    description: "Completed your first emotion tracking session",
    unlocked: totalSessions > 0,
  },
  {
    id: 2,
    name: "3 Day Streak",
    icon: "🔥",
    description: "Maintain a positive streak for 3 consecutive days",
    unlocked: streak >= 3,
  },
  {
    id: 3,
    name: "Positive Week",
    icon: "🏆",
    description: "Keep your mood positive for a full week",
    unlocked: streak >= 7,
  },
  {
    id: 4,
    name: "Task Master",
    icon: "🎯",
    description: "Complete tasks and level up your progress",
    unlocked: tasksCompleted > 0,
  },
  {
    id: 5,
    name: "Wellness Explorer",
    icon: "💬",
    description: "Use the chatbot for wellness support",
    unlocked: chatUses > 0,
  },
];

const buildAchievements = ({ totalSessions, dailyCheckIns, tasksCompleted, chatUses, streak }) => [
  {
    id: 1,
    name: "Early Bird",
    description: "Track emotions early in the week",
    progress: Math.min(7, dailyCheckIns),
    total: 7,
    icon: "🌅",
  },
  {
    id: 2,
    name: "Night Owl",
    description: "Stay consistent with evening reflections",
    progress: Math.min(14, totalSessions),
    total: 14,
    icon: "🦉",
  },
  {
    id: 3,
    name: "Social Butterfly",
    description: "Use in-app support for mental wellness",
    progress: Math.min(10, chatUses),
    total: 10,
    icon: "🦋",
  },
  {
    id: 4,
    name: "Zen Master",
    description: "Build a calm and positive mood streak",
    progress: Math.min(30, streak),
    total: 30,
    icon: "🧘",
  },
];

const getLevelInfo = (xp) => {
  const level = Math.max(1, Math.floor(xp / 500) + 1);
  const xpToNext = Math.max(0, level * 500 - xp);
  return { level, xpToNext };
};

const RewardsZone = () => {
  const [userStats, setUserStats] = useState({
    level: 1,
    xp: 0,
    xpToNext: 500,
    streak: 0,
    totalSessions: 0,
    badges: [],
    achievements: [],
    chatUses: 0,
    tasksCompleted: 0,
  });
  const [rewardState, setRewardState] = useState(getRewardStorage());
  const [selectedReward, setSelectedReward] = useState(null);

  const loadRewardData = () => {
    const storage = getRewardStorage();
    const allEntries = getAllEmotionData();
    const weekSummary = getDailySummaryForCurrentWeek();

    const totalSessions = allEntries.length;
    const dailyCheckIns = weekSummary.filter((day) => day.totalCount > 0).length;

    let positiveStreak = 0;
    for (const day of weekSummary) {
      if (day.totalCount > 0 && day.averageMood >= 60) {
        positiveStreak += 1;
      } else {
        break;
      }
    }

    const chatUses = storage.chatbotUses || 0;
    const tasksCompleted = storage.tasksCompleted || 0;
    const xp = totalSessions + dailyCheckIns * 5 + positiveStreak * 10 + chatUses * 2 + tasksCompleted * 8;
    const { level, xpToNext } = getLevelInfo(xp);

    setUserStats({
      level,
      xp,
      xpToNext,
      streak: positiveStreak,
      totalSessions,
      badges: buildBadges({ totalSessions, streak: positiveStreak, tasksCompleted, chatUses }),
      achievements: buildAchievements({ totalSessions, dailyCheckIns, tasksCompleted, chatUses, streak: positiveStreak }),
      chatUses,
      tasksCompleted,
    });
    setRewardState(storage);
  };

  useEffect(() => {
    loadRewardData();
    const interval = setInterval(loadRewardData, 5000);

    const storageHandler = (event) => {
      if (!event.key || event.key.startsWith("emotion") || event.key.startsWith("emotionRewardsState_")) {
        loadRewardData();
      }
    };

    window.addEventListener("storage", storageHandler);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", storageHandler);
    };
  }, []);

  const redeemReward = (reward) => {
    if (userStats.xp < reward.cost) {
      return;
    }

    if (rewardState.claimedRewards.includes(reward.id)) {
      return;
    }

    claimReward(reward.id);
    loadRewardData();
    setSelectedReward(reward);
    setTimeout(() => setSelectedReward(null), 3000);
  };

  return (
    <div className="rewards-zone-container">
      {/* Header */}
      <motion.div
        className="rewards-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-content">
          <div>
            <h1>Rewards Zone</h1>
            <p>Gamify your emotional wellness journey</p>
          </div>
          <div className="level-display">
            <div className="level-badge">
              <Crown size={24} />
              <span>Level {userStats.level}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* XP Progress */}
      <motion.div
        className="xp-section"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="xp-card">
          <div className="xp-header">
            <div className="xp-icon">
              <Zap size={24} />
            </div>
            <div className="xp-info">
              <h3>{userStats.xp.toLocaleString()} XP</h3>
              <p>{userStats.xpToNext.toLocaleString()} XP to Level {userStats.level + 1}</p>
            </div>
          </div>
          <div className="xp-progress">
            <motion.div
              className="xp-bar"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (userStats.xp / (userStats.level * 500)) * 100)}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            ></motion.div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="stats-grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <motion.div
          className="stat-card streak"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="stat-icon">
            <Flame size={24} />
          </div>
          <div className="stat-content">
            <h4>{userStats.streak}</h4>
            <p>Day Streak</p>
          </div>
        </motion.div>

        <motion.div
          className="stat-card sessions"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="stat-icon">
            <Target size={24} />
          </div>
          <div className="stat-content">
            <h4>{userStats.totalSessions}</h4>
            <p>Total Sessions</p>
          </div>
        </motion.div>

        <motion.div
          className="stat-card badges"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="stat-icon">
            <Award size={24} />
          </div>
          <div className="stat-content">
            <h4>{userStats.badges.filter((b) => b.unlocked).length}</h4>
            <p>Badges Earned</p>
          </div>
        </motion.div>

        <motion.div
          className="stat-card achievements"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="stat-icon">
            <Trophy size={24} />
          </div>
          <div className="stat-content">
            <h4>{userStats.achievements.filter((a) => a.progress >= a.total).length}</h4>
            <p>Achievements</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Badges Section */}
      <motion.div
        className="badges-section"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <h3>Your Badges</h3>
        <div className="badges-grid">
          {userStats.badges.map((badge, index) => (
            <motion.div
              key={badge.id}
              className={`badge-card ${badge.unlocked ? 'unlocked' : 'locked'}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: badge.unlocked ? 1.05 : 1 }}
            >
              <div className="badge-icon">
                {badge.unlocked ? badge.icon : "🔒"}
              </div>
              <div className="badge-info">
                <h4>{badge.name}</h4>
                <p>{badge.description}</p>
              </div>
              {badge.unlocked && (
                <motion.div
                  className="unlocked-sparkle"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Sparkles size={16} />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Achievements Section */}
      <motion.div
        className="achievements-section"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <h3>Achievements in Progress</h3>
        <div className="achievements-grid">
          {userStats.achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              className="achievement-card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="achievement-icon">
                {achievement.icon}
              </div>
              <div className="achievement-info">
                <h4>{achievement.name}</h4>
                <p>{achievement.description}</p>
                <div className="progress-bar">
                  <motion.div
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                  ></motion.div>
                </div>
                <span className="progress-text">
                  {achievement.progress} / {achievement.total}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Rewards Shop */}
      <motion.div
        className="rewards-section"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
      >
        <h3>Rewards Shop</h3>
        <div className="rewards-grid">
          {rewardShopItems.map((reward, index) => {
            const claimed = rewardState.claimedRewards.includes(reward.id);
            return (
              <motion.div
                key={reward.id}
                className={`reward-card ${claimed ? 'unlocked' : 'locked'}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="reward-icon">{reward.icon}</div>
                <div className="reward-info">
                  <h4>{reward.name}</h4>
                  <p>{reward.description}</p>
                  <div className="reward-cost">
                    <Zap size={14} />
                    <span>{reward.cost} XP</span>
                  </div>
                </div>
                <motion.button
                  className={`reward-btn ${userStats.xp >= reward.cost && !claimed ? 'available' : 'disabled'}`}
                  onClick={() => redeemReward(reward)}
                  whileHover={{ scale: userStats.xp >= reward.cost && !claimed ? 1.05 : 1 }}
                  whileTap={{ scale: userStats.xp >= reward.cost && !claimed ? 0.95 : 1 }}
                  disabled={userStats.xp < reward.cost || claimed}
                >
                  {claimed ? 'Owned' : userStats.xp >= reward.cost ? 'Redeem' : 'Locked'}
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Reward Unlock Animation */}
      <AnimatePresence>
        {selectedReward && (
          <motion.div
            className="reward-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="reward-content"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
            >
              <div className="reward-icon-large">{selectedReward.icon}</div>
              <h3>Reward Unlocked!</h3>
              <p>You've successfully redeemed {selectedReward.name}</p>
              <motion.div
                className="confetti"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 0.5,
                  repeat: 3,
                }}
              >
                🎉
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RewardsZone;
