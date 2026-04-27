import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Heart, Brain, Smile, Target } from "lucide-react";
import { getLatestEmotion, incrementChatbotUses } from "../utils/emotionStorage";
import "./ChatAssistant.css";

const ChatAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi! I'm your AI wellness assistant. I can see you're feeling happy today! How can I help you boost your positive energy?",
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentMood, setCurrentMood] = useState('happy');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Real-time mood detection from emotionStorage
  useEffect(() => {
    const updateMood = () => {
      const latest = getLatestEmotion();
      if (latest && latest.dominantEmotion) {
        setCurrentMood(latest.dominantEmotion.toLowerCase());
      } else {
        setCurrentMood('neutral');
      }
    };

    updateMood();
    const interval = setInterval(updateMood, 2000);
    return () => clearInterval(interval);
  }, []);

  const getMoodSuggestion = (mood) => {
    const suggestions = {
      happy: "Great! Keep up the positive energy 😊",
      sad: "Try listening to music or talking to a friend 💙",
      neutral: "Good time to focus and plan your goals 🎯",
      angry: "Take a deep breath and relax for a few minutes 😌",
    };
    return suggestions[mood.toLowerCase()] || "Take a moment to breathe and stay centered.";
  };

  // ✅ IMPROVED: Intelligent chatbot responses based on keyword detection
  const getBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase().trim();

    if (lowerMessage.includes('give me tips')) {
      return getMoodSuggestion(currentMood);
    }

    if (lowerMessage.includes('how is my mood')) {
      const latest = getLatestEmotion();
      if (latest) {
        return `Your latest detected mood is ${latest.dominantEmotion.charAt(0).toUpperCase() + latest.dominantEmotion.slice(1)} (${Math.round(latest.confidence)}%). ${getMoodSuggestion(currentMood)}`;
      }
      return `I don't have your latest mood data yet. Start the emotion detection to see your mood!`;
    }

    if (lowerMessage.includes('motivate me')) {
      const motivations = [
        "Small progress every day becomes big success. Keep going! 💪",
        "You're capable of amazing things. Believe in yourself! 🌟",
        "Every expert was once a beginner. You're on the right path! 🚀",
        "One step at a time. You've got this! 👊",
        "Your future self will thank you for not giving up today. 💯",
      ];
      return motivations[Math.floor(Math.random() * motivations.length)];
    }

    // JOKES
    if (lowerMessage.includes('joke') || lowerMessage.includes('funny')) {
      const jokes = [
        "Why don't scientists trust atoms? Because they make up everything! 😂",
        "Why did the scarecrow win an award? Because he was outstanding in his field! 🌽",
        "What do you call fake spaghetti? An impasta! 🍝",
        "Why don't eggs tell jokes? They'd crack each other up! 🥚",
        "What do you call a bear with no teeth? A gummy bear! 🐻",
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    }

    // ==========================================
    // EMOTION-SPECIFIC RESPONSES (Keyword Detection)
    // ==========================================

    // HAPPY EMOTIONS
    if (
      lowerMessage.includes('happy') ||
      lowerMessage.includes('joy') ||
      lowerMessage.includes('wonderful') ||
      lowerMessage.includes('excellent') ||
      lowerMessage.includes('amazing') ||
      lowerMessage === 'good' ||
      lowerMessage === 'great'
    ) {
      const responses = [
        "That's fantastic! Your positive energy is amazing. What made your day so good?",
        "Wonderful to hear! Keep spreading that joy! 😊",
        "That's great energy! What would you like to do to celebrate?",
        "Awesome! Want to do something fun to make the most of this mood?",
        "Love that positivity! How can I help you maintain this great feeling?",
        "Excellent! Your happiness is contagious. What's bringing you joy today?",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // SAD EMOTIONS
    if (
      lowerMessage.includes('sad') ||
      lowerMessage.includes('down') ||
      lowerMessage.includes('depressed') ||
      lowerMessage.includes('upset') ||
      lowerMessage.includes('miserable') ||
      lowerMessage === 'sad' ||
      lowerMessage === 'bad'
    ) {
      const responses = [
        "I'm sorry you're feeling sad. That's completely valid. Want to talk about what's bothering you?",
        "It's okay to feel down sometimes. Remember, this feeling will pass. How can I help?",
        "I hear you. Sometimes we all have tough days. Would you like some suggestions to feel better?",
        "Sadness is a natural emotion. Let's work through this together. What happened?",
        "I'm here for you. Want to share what's making you feel this way?",
        "It's brave of you to acknowledge your sadness. What would help right now?",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // STRESSED/ANXIOUS
    if (
      lowerMessage.includes('stress') ||
      lowerMessage.includes('anxious') ||
      lowerMessage.includes('anxiety') ||
      lowerMessage.includes('overwhelm') ||
      lowerMessage.includes('pressure') ||
      lowerMessage === 'stressed'
    ) {
      const responses = [
        "Stress can feel heavy. Try taking a few deep breaths - breathe in for 4 counts, hold for 4, exhale for 4. Better?",
        "Anxiety is tough. Remember, you've overcome difficult moments before. What's worrying you?",
        "I understand you're feeling overwhelmed. Let's break things down. What's the biggest concern right now?",
        "Take a moment to pause. Sometimes stepping back helps us see things more clearly. What's causing the stress?",
        "Deep breathing can help: Inhale slowly for 4, hold for 4, exhale for 4. Try it now.",
        "When stress builds, grounding techniques help. What's one thing you can focus on right now?",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // ANGRY/FRUSTRATED
    if (
      lowerMessage.includes('angry') ||
      lowerMessage.includes('furious') ||
      lowerMessage.includes('frustrated') ||
      lowerMessage.includes('irritated') ||
      lowerMessage.includes('upset') ||
      lowerMessage === 'angry' ||
      lowerMessage === 'mad'
    ) {
      const responses = [
        "Anger is valid. Let's find a healthy way to process it. What's bothering you?",
        "I can sense your frustration. Take a moment - would a walk or some exercise help release the tension?",
        "Feeling angry is okay. Try progressive muscle relaxation or a quick workout to release the energy.",
        "I understand you're upset. Sometimes we need to cool down first. Want to talk about what happened?",
        "Anger shows you care about something. Let's channel it productively. What triggered this?",
        "It's okay to feel angry. Want some techniques to help process these feelings?",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // TIRED/EXHAUSTED
    if (
      lowerMessage.includes('tired') ||
      lowerMessage.includes('exhausted') ||
      lowerMessage.includes('fatigue') ||
      lowerMessage.includes('sleep') ||
      lowerMessage.includes('rest') ||
      lowerMessage === 'tired'
    ) {
      const responses = [
        "You sound exhausted. Your body might be telling you it needs rest. Have you been sleeping well?",
        "Fatigue is a signal to slow down. Consider taking a nap or getting some quality sleep tonight.",
        "I hear the tiredness. Self-care starts with rest. How about some relaxation time?",
        "When exhaustion sets in, rest is the best medicine. Make sleep a priority tonight. You deserve it.",
        "Sleep is crucial for emotional health. What time did you go to bed last night?",
        "Rest is important. Even a short break can recharge you. What would help you relax?",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // FEELING GOOD/MOTIVATED
    if (
      lowerMessage.includes('motivated') ||
      lowerMessage.includes('energized') ||
      lowerMessage.includes('productive') ||
      lowerMessage.includes('focused') ||
      lowerMessage.includes('ready')
    ) {
      const responses = [
        "That's the spirit! Channel that energy into your goals. What do you want to accomplish?",
        "Awesome! This is the perfect time to tackle what matters to you. Go for it!",
        "Love that energy! What's your next big goal or project?",
        "You're in a great headspace. Let's make something amazing happen today!",
        "Motivation is powerful! What project are you excited about?",
        "Great mindset! How can I support your productivity today?",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // BORED
    if (lowerMessage.includes('bored') || lowerMessage.includes('boring')) {
      const responses = [
        "Boredom can be an opportunity! Try learning something new for 10 minutes today.",
        "When bored, creativity often follows. What hobby have you been wanting to try?",
        "Boredom is a signal to explore. What's something new you'd like to discover?",
        "Try a short walk or listen to new music. Sometimes change of scenery helps!",
        "Bored? Challenge yourself with a puzzle or game. Your brain will thank you!",
        "Boredom often means you need stimulation. What interests you that you haven't tried?",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // ==========================================
    // GREETING/CONVERSATION STARTERS
    // ==========================================
    if (
      lowerMessage === 'hi' ||
      lowerMessage === 'hello' ||
      lowerMessage === 'hey' ||
      lowerMessage === 'hello!' ||
      lowerMessage === 'hi!' ||
      lowerMessage === 'hey!'
    ) {
      const responses = [
        `Hello! I'm here to support your emotional wellness. How are you feeling today?`,
        `Hi there! Great to see you. What's on your mind?`,
        `Hey! How are you doing? Anything I can help with?`,
        `Hello! I'm your AI wellness companion. Tell me about your day!`,
        `Hi! Ready to chat about your emotions and well-being?`,
        `Hello! I'm your AI wellness companion. Tell me about your day!`,
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // ==========================================
    // ACTIVITY/HELP REQUESTS
    // ==========================================
    if (
      lowerMessage.includes('what should i do') ||
      lowerMessage.includes('what can i do') ||
      lowerMessage.includes('activity') ||
      lowerMessage.includes('suggestion') ||
      lowerMessage.includes('recommend')
    ) {
      const responses = [
        `Since you're feeling ${currentMood}, here are some tailored suggestions: ${getMoodSuggestion(currentMood)}`,
        "Great question! It depends on your mood. For energizing, try exercise or creative projects. For calming, try meditation or reading. What appeals to you?",
        "I'd suggest trying something that aligns with your current mood. Want outdoor activities, creative pursuits, or relaxation?",
        "Here are some options: Physical activity, creative projects, spending time with loved ones, or mindfulness practices. Which sounds good?",
        "Depending on your energy level, you could try: A short walk, journaling, calling a friend, or learning something new. What fits right now?",
        `Based on your ${currentMood} mood, I recommend: ${getMoodSuggestion(currentMood)}`,
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // BREATHING/CALMING TECHNIQUES
    if (
      lowerMessage.includes('calm') ||
      lowerMessage.includes('relax') ||
      lowerMessage.includes('meditat') ||
      lowerMessage.includes('breathing') ||
      lowerMessage.includes('breathe')
    ) {
      const responses = [
        "Let's try a simple breathing exercise: Breathe in slowly for 4 counts, hold for 4, exhale for 4. Repeat 5 times. You should feel calmer.",
        "Mindfulness can help. Try focusing on your breath and body sensations for just 2 minutes. It's surprisingly effective.",
        "Progressive muscle relaxation is great for stress. Tense each muscle group for 5 seconds, then release. Works wonders!",
        "Would you like to try a guided meditation? Even 5-10 minutes of mindfulness can reset your nervous system.",
        "Try the 4-7-8 breathing: Inhale for 4, hold for 7, exhale for 8. It's very calming.",
        "Grounding technique: Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // SLEEP/REST
    if (
      lowerMessage.includes('sleep') ||
      lowerMessage.includes('rest') ||
      lowerMessage.includes('nap') ||
      lowerMessage.includes('bed')
    ) {
      const responses = [
        "Quality sleep is essential for emotional wellness. Try going to bed 30 minutes earlier tonight. Your mind and body will thank you!",
        "If you're struggling to sleep, try: No screens 30 min before bed, cool dark room, and deep breathing. Sleep hygiene matters!",
        "A good nap can reset your mood! Even 20-30 minutes can make a big difference. Sometimes rest is the best medicine.",
        "Sleep is when your brain processes emotions. Prioritize good sleep tonight. You deserve to feel refreshed!",
        "Sleep deprivation affects mood. Aim for 7-9 hours tonight. What can you do to improve your sleep?",
        "Rest is important. Even a short break can recharge you. What would help you relax?",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // SOCIAL/SUPPORT
    if (
      lowerMessage.includes('friend') ||
      lowerMessage.includes('talk') ||
      lowerMessage.includes('someone') ||
      lowerMessage.includes('support') ||
      lowerMessage.includes('help')
    ) {
      const responses = [
        "Reaching out to friends or loved ones is powerful. Have you considered calling someone you trust to talk?",
        "Sometimes talking things through helps so much. Who's someone you feel comfortable opening up to?",
        "Social support is crucial for emotional health. Don't hesitate to reach out to people who care about you.",
        "I'm here to listen, but also remember: real human connections are valuable. Have you talked to anyone close to you?",
        "Sharing with others can lighten the load. Who in your life makes you feel supported?",
        "You're not alone in this. Talking to someone can provide new perspectives. Who can you reach out to?",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // ==========================================
    // DEFAULT INTELLIGENT RESPONSES
    // ==========================================
    // If message is a question
    if (lowerMessage.includes('?')) {
      const responses = [
        "That's an interesting question. Tell me more about what's leading you to ask that.",
        "I'm here to help with that. What specific aspect would you like to explore?",
        "Great question! Let's think through this together. What's prompting this question?",
        "I like where your head is at. What do you think might be the answer?",
        "Good thinking! What are your thoughts on this?",
        "That's worth exploring. What do you think the solution might be?",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // If message is very short
    if (lowerMessage.length < 5) {
      const responses = [
        "I'm here to listen. Tell me more about how you're feeling!",
        "What's on your mind? I'm ready to support you.",
        "I'd love to hear more. What are you experiencing right now?",
        "Let's talk more about this. What's happening?",
        "I'm listening. What's going on?",
        "Tell me more. I'm here for you.",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // ==========================================
    // FALLBACK: GENERAL SUPPORTIVE RESPONSES
    // ==========================================
    const fallbackResponses = [
      "I hear you. Your feelings are valid and important. What would help right now?",
      "Thank you for sharing. I'm here to support you through whatever you're experiencing.",
      "That sounds significant. Tell me more about how that's affecting you.",
      "I appreciate you opening up. Remember, you're not alone in this.",
      "Your emotional well-being matters. What can I do to support you?",
      "I'm here to help. What would make things better right now?",
      "That sounds important. How can I support you with this?",
      "Your feelings matter. Let's work through this together.",
    ];
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  };

  const sendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    incrementChatbotUses();

    setTimeout(() => {
      const botResponse = getBotResponse(messageText);
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: botResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getMoodEmoji = (mood) => {
    const emojis = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      calm: '😌',
      neutral: '😐'
    };
    return emojis[mood] || '😐';
  };

  const getMoodColor = (mood) => {
    const colors = {
      happy: '#22c55e',
      sad: '#3b82f6',
      angry: '#ef4444',
      calm: '#f59e0b',
      neutral: '#6b7280'
    };
    return colors[mood] || '#6b7280';
  };

  return (
    <div className="chat-assistant-container">
      {/* Header */}
      <motion.div
        className="chat-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-content">
          <div className="bot-info">
            <div className="bot-avatar">
              <Bot size={24} />
            </div>
            <div>
              <h1>AI Wellness Assistant</h1>
              <p>Mood-aware emotional support</p>
            </div>
          </div>
          <div className="mood-indicator">
            <div
              className="mood-emoji"
              style={{ backgroundColor: getMoodColor(currentMood) }}
            >
              {getMoodEmoji(currentMood)}
            </div>
            <span className="mood-label">
              You're feeling {currentMood}
            </span>
          </div>
          <div className="mood-suggestion">
            {getMoodSuggestion(currentMood)}
          </div>
        </div>
      </motion.div>

      {/* Chat Messages */}
      <motion.div
        className="chat-messages"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              className={`message ${message.type}`}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="message-avatar">
                {message.type === 'bot' ? (
                  <Bot size={20} />
                ) : (
                  <User size={20} />
                )}
              </div>
              <div className="message-content">
                <p>{message.content}</p>
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              className="message bot typing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="message-avatar">
                <Bot size={20} />
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </motion.div>

      {/* Quick Suggestions */}
      <motion.div
        className="quick-suggestions"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h4>Quick replies</h4>
        <div className="suggestions-grid">
          {[
            { label: "Give me tips", value: "Give me tips" },
            { label: "How is my mood?", value: "How is my mood?" },
            { label: "Motivate me", value: "Motivate me" },
          ].map((item) => (
            <motion.button
              key={item.value}
              className="suggestion-btn"
              onClick={() => sendMessage(item.value)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {item.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Chat Input */}
      <motion.div
        className="chat-input-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="chat-input">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isTyping}
          />
          <motion.button
            className="send-btn"
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isTyping}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Send size={20} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatAssistant;