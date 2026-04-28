import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { TrendingUp, Activity, Target } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import NotificationBell from "./NotificationBell";
import {
  saveEmotionData,
  getTodayEmotions,
  getEmotionDistribution,
  getDistributionPercentages,
  getAverageConfidence,
  getLatestEmotion,
} from "../utils/emotionStorage";
import { createNotification } from "../utils/notificationStorage";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [currentStats, setCurrentStats] = useState({
    todayEmotion: 'neutral',
    detectionCount: 0,
    averageConfidence: 0
  });
  const [todayEmotions, setTodayEmotions] = useState([]);
  const [faceDetected, setFaceDetected] = useState(true);

  useEffect(() => {
    const loggedIn = localStorage.getItem("loggedIn");
    if (!loggedIn) navigate("/");
  }, [navigate]);

  // Fetch today's stats on component mount
  useEffect(() => {
    fetchTodayStats();
  }, []);

  // ============================================
  // REAL-TIME UPDATE FROM EMOTION STORAGE
  // ============================================
  const fetchTodayStats = () => {
    try {
      // Get today's emotions from localStorage
      const todayData = getTodayEmotions();

      if (todayData.length > 0) {
        // Get latest emotion
        const latest = todayData[todayData.length - 1];
        
        // Calculate distribution
        const distribution = getEmotionDistribution(todayData);
        
        // Get average confidence
        const avgConfidence = getAverageConfidence(todayData);

        // Update stats
        setCurrentStats({
          todayEmotion: latest.dominantEmotion || 'neutral',
          detectionCount: todayData.length,
          averageConfidence: avgConfidence,
        });

        // Convert distribution to chart data
        const chartData = getDistributionPercentages(distribution);
        setTodayEmotions(chartData);
      } else {
        // No data yet, show defaults
        setCurrentStats({
          todayEmotion: 'No detections',
          detectionCount: 0,
          averageConfidence: 0,
        });
        setTodayEmotions([]);
      }
    } catch (error) {
      console.log("Error fetching today's stats:", error);
    }
  };

  useEffect(() => {
    if (cameraOn && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraOn]);

  const stopDetection = () => {
    setCameraOn(false);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, 320, 240);
    }
  };

  const startDetection = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });

    streamRef.current = stream;
    setCameraOn(true);

    const smoothBox = { x: 0, y: 0, w: 0, h: 0 };

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas) return;

      const ctx = canvas.getContext("2d");

      ctx.clearRect(0, 0, 320, 240);
      ctx.drawImage(video, 0, 0, 320, 240);

      try {
        const res = await axios.post("http://127.0.0.1:8000/api/emotion/", {
          image: canvas.toDataURL("image/jpeg"),
          username: localStorage.getItem("loggedUser"),
          timestamp: new Date().toISOString()
        });

        const data = res.data;
        const emotion = data.emotion;
        const confidence = data.confidence ?? 0;

        // Handle "no face detected" case
        if (!emotion || emotion === "no face detected") {
          setFaceDetected(false);
          return;
        }

        setFaceDetected(true);

        // ============================================
        // SAVE TO EMOTION STORAGE WITH DEDUPLICATION
        // ============================================
        const previousEmotion = getLatestEmotion();
        const saved = saveEmotionData({
          emotion: emotion,
          confidence: confidence,
          timestamp: Date.now(),
          date: new Date().toISOString().split("T")[0],
          time: new Date().toLocaleTimeString(),
          allScores: data.allScores || {},
        });

        // Only refresh stats if new data was saved (not a duplicate)
        if (saved) {
          fetchTodayStats();

          createNotification(
            {
              title: "New emotion detected",
              message: `Detected ${emotion} with ${Math.round(confidence)}% confidence.`,
              type: "info",
              icon: "🔍",
            },
            localStorage.getItem("loggedUser") || "guest"
          );

          if (
            previousEmotion &&
            previousEmotion.dominantEmotion !== emotion &&
            Math.abs((confidence || 0) - (previousEmotion.confidence || 0)) >= 10
          ) {
            createNotification(
              {
                title: "Mood changed significantly",
                message: `Your mood shifted from ${previousEmotion.dominantEmotion} to ${emotion}.`,
                type: "warning",
                icon: "⚡",
              },
              localStorage.getItem("loggedUser") || "guest"
            );
          }
        }

        // Drawing code for visualization
        const x = data.x ?? 80;
        const y = data.y ?? 70;
        const w = data.w ?? 160;
        const h = data.h ?? 160;

        const colors = {
          happy: "#22c55e",
          sad: "#3b82f6",
          angry: "#ef4444",
          neutral: "#facc15",
          surprised: "#a855f7",
          fear: "#f97316",
        };

        const color = colors[emotion] || "#00c6ff";

        smoothBox.x += (x - smoothBox.x) * 0.3;
        smoothBox.y += (y - smoothBox.y) * 0.3;
        smoothBox.w += (w - smoothBox.w) * 0.3;
        smoothBox.h += (h - smoothBox.h) * 0.3;

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;

        ctx.strokeRect(
          smoothBox.x,
          smoothBox.y,
          smoothBox.w,
          smoothBox.h
        );

        const label = `${emotion} (${Math.round(confidence)}%)`;

        ctx.font = "bold 16px Arial";
        const textWidth = ctx.measureText(label).width;

        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(
          smoothBox.x,
          smoothBox.y - 28,
          textWidth + 10,
          20
        );

        ctx.fillStyle = color;
        ctx.fillText(label, smoothBox.x + 5, smoothBox.y - 13);

      } catch (err) {
        console.log(err);
      }
    }, 1000);
  };

  return (
    <div className="dashboard-container">

      {/* TOP RIGHT CONTROLS - Only Notification Bell */}
      <div className="top-right-actions">
        <NotificationBell />
      </div>

      {/* LEFT PANEL */}
      <div className="left-panel">
        <h1>Emotion AI</h1>
        <p>Real-time facial emotion detection system</p>

        {/* Today's Stats */}
        <div className="today-stats">
          <div className="stat-card">
            <Activity size={20} />
            <div>
              <h4>{currentStats.detectionCount}</h4>
              <p>Detections Today</p>
            </div>
          </div>

          <div className="stat-card">
            <Target size={20} />
            <div>
              <h4>{currentStats.averageConfidence}%</h4>
              <p>Avg Confidence</p>
            </div>
          </div>

          <div className="stat-card">
            <TrendingUp size={20} />
            <div>
              <h4>{currentStats.todayEmotion}</h4>
              <p>Top Emotion</p>
            </div>
          </div>
        </div>
      </div>

      {/* DASHBOARD */}
      <div className="dashboard-card">

        <h2 className="title">Live Detection</h2>
        <p className="subtitle">Real-time emotion analysis</p>

        {/* Camera Status Indicator */}
        <div className="camera-status">
          <div className={`status-indicator ${cameraOn ? 'active' : 'inactive'}`}>
            <div className="status-dot"></div>
            <span>{cameraOn ? 'Camera Active - Detecting Emotions' : 'Camera Inactive'}</span>
          </div>
        </div>

        <div className="btn-group">
          <button
            className={`start-btn ${cameraOn ? 'active' : ''}`}
            onClick={startDetection}
            disabled={cameraOn}
          >
            {cameraOn ? '📹 Camera Active' : '▶️ Start Camera'}
          </button>

          <button
            className={`stop-btn ${!cameraOn ? 'disabled' : 'active'}`}
            onClick={stopDetection}
            disabled={!cameraOn}
          >
            {cameraOn ? '⏹️ Stop Camera' : '⏹️ Stop Camera'}
          </button>
        </div>

        <div className="camera-box">
          {cameraOn && (
            <>
              <video ref={videoRef} autoPlay style={{ display: "none" }} />
              <canvas ref={canvasRef} width="320" height="240" />
            </>
          )}
        </div>

        {/* Today's Emotion Distribution */}
        {cameraOn && !faceDetected && (
          <div className="emotion-chart">
            <h3>⚠️ No Face Detected</h3>
            <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '10px' }}>
              Position your face in front of the camera to start detection.
            </p>
          </div>
        )}

        {cameraOn && faceDetected && todayEmotions.length > 0 && (
          <div className="emotion-chart">
            <h3>Today's Emotions (Real-time)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={todayEmotions}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {todayEmotions.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

      </div>
    </div>
  );
}

export default Dashboard;