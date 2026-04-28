import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, Target, Heart, Brain, Zap, Coffee, Book, Music, Users } from "lucide-react";
import { getLatestEmotion, incrementTasksCompleted } from "../utils/emotionStorage";
import { createNotification } from "../utils/notificationStorage";
import "./TasksSuggestions.css";

const TasksSuggestions = () => {
  const [currentMood, setCurrentMood] = useState('neutral');
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState('all');

  const getTaskStorageKey = () => {
    const username = localStorage.getItem('loggedUser') || 'guest';
    return `tasksCompletedIds_${username}`;
  };

  const loadCompletedTaskIds = () => {
    const raw = localStorage.getItem(getTaskStorageKey());
    if (!raw) return new Set();
    try {
      return new Set(JSON.parse(raw));
    } catch {
      return new Set();
    }
  };

  useEffect(() => {
    const updateMood = () => {
      const latest = getLatestEmotion();
      if (latest && latest.dominantEmotion) {
        setCurrentMood(latest.dominantEmotion.toLowerCase());
      } else {
        setCurrentMood('neutral'); // Fallback
      }
    };

    // Initial load
    updateMood();

    // Poll every 2 seconds for real-time updates
    const interval = setInterval(updateMood, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCompletedTasks(loadCompletedTaskIds());
  }, []);

  const taskCategories = {
    happy: {
      color: '#22c55e',
      icon: '😊',
      tasks: [
        {
          id: 1,
          title: "Creative Project",
          description: "Start that painting, writing, or music project you've been thinking about",
          duration: "60 min",
          difficulty: "Medium",
          category: "creative",
          benefits: ["Boosts creativity", "Increases satisfaction", "Builds skills"]
        },
        {
          id: 2,
          title: "Social Connection",
          description: "Call a friend or plan a get-together with loved ones",
          duration: "30 min",
          difficulty: "Easy",
          category: "social",
          benefits: ["Strengthens relationships", "Reduces isolation", "Spreads positivity"]
        },
        {
          id: 3,
          title: "Physical Activity",
          description: "Go for a run, dance, or try a new workout routine",
          duration: "45 min",
          difficulty: "Medium",
          category: "fitness",
          benefits: ["Releases endorphins", "Improves health", "Increases energy"]
        },
        {
          id: 4,
          title: "Learn Something New",
          description: "Take an online course, read about a new topic, or practice a skill",
          duration: "30 min",
          difficulty: "Easy",
          category: "learning",
          benefits: ["Expands knowledge", "Builds confidence", "Keeps mind active"]
        },
        {
          id: 5,
          title: "Help Someone",
          description: "Volunteer, help a neighbor, or do something kind for others",
          duration: "60 min",
          difficulty: "Medium",
          category: "social",
          benefits: ["Increases happiness", "Creates meaning", "Builds community"]
        }
      ]
    },
    sad: {
      color: '#3b82f6',
      icon: '😢',
      tasks: [
        {
          id: 6,
          title: "Gentle Walk",
          description: "Take a slow walk in nature or around your neighborhood",
          duration: "20 min",
          difficulty: "Easy",
          category: "outdoor",
          benefits: ["Lifts mood naturally", "Provides perspective", "Gentle exercise"]
        },
        {
          id: 7,
          title: "Comforting Activity",
          description: "Watch a favorite movie, read a comforting book, or listen to soothing music",
          duration: "60 min",
          difficulty: "Easy",
          category: "relaxation",
          benefits: ["Provides comfort", "Distracts from sadness", "Emotional release"]
        },
        {
          id: 8,
          title: "Talk to Someone",
          description: "Call a trusted friend or family member to share how you're feeling",
          duration: "30 min",
          difficulty: "Medium",
          category: "social",
          benefits: ["Reduces isolation", "Gets support", "Shares burden"]
        },
        {
          id: 9,
          title: "Self-Care Ritual",
          description: "Take a warm bath, practice gentle stretching, or prepare a favorite meal",
          duration: "45 min",
          difficulty: "Easy",
          category: "selfcare",
          benefits: ["Shows self-compassion", "Physical comfort", "Routine comfort"]
        },
        {
          id: 10,
          title: "Gratitude Practice",
          description: "Write down 3 things you're grateful for, no matter how small",
          duration: "10 min",
          difficulty: "Easy",
          category: "mindfulness",
          benefits: ["Shifts perspective", "Builds resilience", "Increases positivity"]
        }
      ]
    },
    angry: {
      color: '#ef4444',
      icon: '😠',
      tasks: [
        {
          id: 11,
          title: "Deep Breathing",
          description: "Practice 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s",
          duration: "5 min",
          difficulty: "Easy",
          category: "breathing",
          benefits: ["Calms nervous system", "Reduces anger", "Quick relief"]
        },
        {
          id: 12,
          title: "Physical Release",
          description: "Go for a brisk walk, do jumping jacks, or punch a pillow safely",
          duration: "15 min",
          difficulty: "Medium",
          category: "physical",
          benefits: ["Releases tension", "Burns energy", "Natural stress relief"]
        },
        {
          id: 13,
          title: "Write It Out",
          description: "Journal about what's making you angry and possible solutions",
          duration: "20 min",
          difficulty: "Medium",
          category: "reflection",
          benefits: ["Processes emotions", "Finds clarity", "Problem solving"]
        },
        {
          id: 14,
          title: "Change Environment",
          description: "Step away from the situation, go to another room, or take a drive",
          duration: "10 min",
          difficulty: "Easy",
          category: "environment",
          benefits: ["Creates space", "Reduces triggers", "Fresh perspective"]
        },
        {
          id: 15,
          title: "Progressive Relaxation",
          description: "Tense and release each muscle group from toes to head",
          duration: "15 min",
          difficulty: "Easy",
          category: "relaxation",
          benefits: ["Reduces physical tension", "Promotes calm", "Body awareness"]
        }
      ]
    },
    neutral: {
      color: '#6b7280',
      icon: '😐',
      tasks: [
        {
          id: 16,
          title: "Productive Work",
          description: "Focus on important tasks that need completion",
          duration: "60 min",
          difficulty: "Medium",
          category: "productivity",
          benefits: ["Gets things done", "Builds momentum", "Sense of accomplishment"]
        },
        {
          id: 17,
          title: "Skill Building",
          description: "Practice a skill or hobby you've been wanting to improve",
          duration: "45 min",
          difficulty: "Medium",
          category: "learning",
          benefits: ["Personal growth", "Increases competence", "Boosts confidence"]
        },
        {
          id: 18,
          title: "Social Planning",
          description: "Plan future social activities or reach out to maintain connections",
          duration: "20 min",
          difficulty: "Easy",
          category: "social",
          benefits: ["Maintains relationships", "Future enjoyment", "Connection planning"]
        },
        {
          id: 19,
          title: "Health Check-in",
          description: "Review diet, exercise, and sleep habits for optimization",
          duration: "15 min",
          difficulty: "Easy",
          category: "health",
          benefits: ["Health awareness", "Preventive care", "Wellness focus"]
        },
        {
          id: 20,
          title: "Goal Setting",
          description: "Set small, achievable goals for the day or week ahead",
          duration: "20 min",
          difficulty: "Easy",
          category: "planning",
          benefits: ["Provides direction", "Increases motivation", "Future focus"]
        }
      ]
    },
    fear: {
      color: '#8b5cf6',
      icon: '😨',
      tasks: [
        {
          id: 21,
          title: "Grounding Exercise",
          description: "Use 5-4-3-2-1 technique: name 5 things you see, 4 you can touch, etc.",
          duration: "5 min",
          difficulty: "Easy",
          category: "grounding",
          benefits: ["Reduces anxiety", "Brings to present", "Calms nervous system"]
        },
        {
          id: 22,
          title: "Reassurance Checklist",
          description: "Write down your fears and counter each with realistic reassurances",
          duration: "15 min",
          difficulty: "Medium",
          category: "reflection",
          benefits: ["Challenges irrational fears", "Builds confidence", "Rational thinking"]
        },
        {
          id: 23,
          title: "Guided Meditation",
          description: "Listen to a short guided meditation for anxiety relief",
          duration: "10 min",
          difficulty: "Easy",
          category: "meditation",
          benefits: ["Reduces fear response", "Promotes calm", "Mindfulness practice"]
        },
        {
          id: 24,
          title: "Light Physical Activity",
          description: "Take a gentle walk or do simple stretching exercises",
          duration: "20 min",
          difficulty: "Easy",
          category: "physical",
          benefits: ["Releases tension", "Improves focus", "Natural anxiety relief"]
        },
        {
          id: 25,
          title: "Comfort Item",
          description: "Spend time with a comforting object, photo, or memory",
          duration: "10 min",
          difficulty: "Easy",
          category: "comfort",
          benefits: ["Provides security", "Emotional comfort", "Reduces isolation"]
        }
      ]
    },
    surprise: {
      color: '#f59e0b',
      icon: '😲',
      tasks: [
        {
          id: 26,
          title: "Explore New Skill",
          description: "Try learning something unexpected or unusual",
          duration: "30 min",
          difficulty: "Medium",
          category: "learning",
          benefits: ["Expands horizons", "Builds adaptability", "Creates excitement"]
        },
        {
          id: 27,
          title: "Creative Experiment",
          description: "Try a new art technique or creative approach you've never attempted",
          duration: "45 min",
          difficulty: "Medium",
          category: "creative",
          benefits: ["Fosters innovation", "Builds confidence", "Fun discovery"]
        },
        {
          id: 28,
          title: "Visit New Place",
          description: "Explore a new location, store, or area in your city",
          duration: "60 min",
          difficulty: "Easy",
          category: "exploration",
          benefits: ["Broadens perspective", "Creates memories", "Reduces routine"]
        },
        {
          id: 29,
          title: "Watch Documentary",
          description: "Learn about an interesting topic or current event",
          duration: "45 min",
          difficulty: "Easy",
          category: "learning",
          benefits: ["Increases knowledge", "Sparks curiosity", "Mental stimulation"]
        },
        {
          id: 30,
          title: "Brainstorm Ideas",
          description: "Write down creative ideas for projects or life improvements",
          duration: "20 min",
          difficulty: "Easy",
          category: "planning",
          benefits: ["Generates possibilities", "Boosts motivation", "Future planning"]
        }
      ]
    },
    disgust: {
      color: '#10b981',
      icon: '🤢',
      tasks: [
        {
          id: 31,
          title: "Clean Environment",
          description: "Tidy up your workspace, room, or living area",
          duration: "30 min",
          difficulty: "Easy",
          category: "cleaning",
          benefits: ["Creates order", "Reduces stress", "Improves mood"]
        },
        {
          id: 32,
          title: "Refresh Routine",
          description: "Change your clothes, take a shower, or freshen up your space",
          duration: "20 min",
          difficulty: "Easy",
          category: "hygiene",
          benefits: ["Physical refresh", "Mental reset", "Improved comfort"]
        },
        {
          id: 33,
          title: "Organize Items",
          description: "Sort through drawers, closets, or digital files",
          duration: "45 min",
          difficulty: "Medium",
          category: "organization",
          benefits: ["Creates control", "Reduces overwhelm", "Sense of accomplishment"]
        },
        {
          id: 34,
          title: "Positive Distraction",
          description: "Listen to uplifting music or watch something enjoyable",
          duration: "30 min",
          difficulty: "Easy",
          category: "entertainment",
          benefits: ["Shifts focus", "Improves mood", "Emotional relief"]
        },
        {
          id: 35,
          title: "Healthy Meal Prep",
          description: "Prepare a nutritious meal or snack with fresh ingredients",
          duration: "25 min",
          difficulty: "Easy",
          category: "nutrition",
          benefits: ["Nourishes body", "Provides comfort", "Health focus"]
        }
      ]
    }
  };

  const getMoodIcon = (mood) => {
    const icons = {
      happy: Heart,
      sad: Heart,
      angry: Zap,
      neutral: Target,
      fear: Brain,
      surprise: Zap,
      disgust: Coffee
    };
    return icons[mood] || Target;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      creative: Book,
      social: Users,
      fitness: Zap,
      learning: Brain,
      outdoor: Heart,
      relaxation: Coffee,
      selfcare: Heart,
      mindfulness: Brain,
      breathing: Heart,
      physical: Zap,
      reflection: Book,
      environment: Target,
      organization: Target,
      productivity: Target,
      health: Heart,
      planning: Target
    };
    return icons[category] || Target;
  };

  const toggleTaskCompletion = (taskId) => {
    setCompletedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
        try {
          const completedIds = loadCompletedTaskIds();
          if (!completedIds.has(taskId)) {
            completedIds.add(taskId);
            localStorage.setItem(getTaskStorageKey(), JSON.stringify([...completedIds]));
            incrementTasksCompleted();
            createNotification(
              {
                title: "Task completed",
                message: `You've completed a task from your ${currentMood} mood suggestions.`,
                type: "task",
                icon: "✅",
              },
              localStorage.getItem("loggedUser") || "guest"
            );
          }
        } catch {
          // Fail silently if storage is unavailable
        }
      }
      return newSet;
    });
  };

  const filteredTasks = selectedCategory === 'all'
    ? taskCategories[currentMood].tasks
    : taskCategories[currentMood].tasks.filter(task => task.category === selectedCategory);

  const categories = [...new Set(taskCategories[currentMood].tasks.map(task => task.category))];

  return (
    <div className="tasks-suggestions-container">
      {/* Header */}
      <motion.div
        className="tasks-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-content">
          <div>
            <h1>Tasks & Suggestions</h1>
            <p>Personalized recommendations based on your current mood: {currentMood.charAt(0).toUpperCase() + currentMood.slice(1)}</p>
          </div>
        </div>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        className="category-filter"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <button
          className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          All Tasks
        </button>
        {categories.map(category => (
          <motion.button
            key={category}
            className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </motion.button>
        ))}
      </motion.div>

      {/* Tasks Grid */}
      <motion.div
        className="tasks-grid"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {filteredTasks.map((task, index) => {
          const CategoryIcon = getCategoryIcon(task.category);
          const isCompleted = completedTasks.has(task.id);

          return (
            <motion.div
              key={task.id}
              className={`task-card ${isCompleted ? 'completed' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="task-header">
                <div className="task-category">
                  <CategoryIcon size={16} />
                  <span>{task.category}</span>
                </div>
                <motion.button
                  className={`complete-btn ${isCompleted ? 'completed' : ''}`}
                  onClick={() => toggleTaskCompletion(task.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <CheckCircle size={20} />
                </motion.button>
              </div>

              <div className="task-content">
                <h3>{task.title}</h3>
                <p>{task.description}</p>

                <div className="task-meta">
                  <div className="meta-item">
                    <Clock size={14} />
                    <span>{task.duration}</span>
                  </div>
                  <div className="meta-item">
                    <Target size={14} />
                    <span>{task.difficulty}</span>
                  </div>
                </div>

                <div className="task-benefits">
                  <h4>Benefits:</h4>
                  <ul>
                    {task.benefits.map((benefit, idx) => (
                      <li key={idx}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {isCompleted && (
                <motion.div
                  className="completion-overlay"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <CheckCircle size={32} />
                  <span>Completed!</span>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Mood-Based Insights */}
      <motion.div
        className="mood-insights"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <h3>Why These Tasks?</h3>
        <div className="insights-content">
          {currentMood === 'happy' && (
            <p>When you're feeling happy, it's the perfect time to channel that positive energy into activities that build momentum and create even more joy in your life.</p>
          )}
          {currentMood === 'sad' && (
            <p>When feeling down, gentle, comforting activities can help lift your spirits while being mindful of your emotional state.</p>
          )}
          {currentMood === 'angry' && (
            <p>Anger often comes with physical tension. These suggestions focus on safe ways to release that energy and regain calm.</p>
          )}
          {currentMood === 'neutral' && (
            <p>A neutral mood provides the perfect balance for productive work and planning activities that move you forward.</p>
          )}
          {currentMood === 'fear' && (
            <p>When feeling anxious or fearful, grounding and reassurance activities can help bring you back to the present and reduce worry.</p>
          )}
          {currentMood === 'surprise' && (
            <p>Surprise energy is great for exploration and creativity. Use this momentum to try new things and expand your horizons.</p>
          )}
          {currentMood === 'disgust' && (
            <p>Disgust often signals a need for change. Cleaning and refreshing activities can help create a more positive environment.</p>
          )}
        </div>
      </motion.div>

      {/* Progress Summary */}
      <motion.div
        className="progress-summary"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <h3>Today's Progress</h3>
        <div className="progress-stats">
          <div className="stat-item">
            <div className="stat-number">{completedTasks.size}</div>
            <div className="stat-label">Tasks Completed</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{filteredTasks.length}</div>
            <div className="stat-label">Tasks Available</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">
              {filteredTasks.length > 0 ? Math.round((completedTasks.size / filteredTasks.length) * 100) : 0}%
            </div>
            <div className="stat-label">Completion Rate</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TasksSuggestions;