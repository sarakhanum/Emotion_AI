import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Download, TrendingUp, TrendingDown, Calendar, Award, Target } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { getWeeklyReportData } from "../utils/emotionStorage";
import "./WeeklyReports.css";

const WeeklyReports = () => {
  const [weeklyData, setWeeklyData] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const reportRef = useRef();

  useEffect(() => {
    const loadWeeklyReport = () => {
      const report = getWeeklyReportData();
      setWeeklyData(report);
    };

    loadWeeklyReport();
    const interval = setInterval(loadWeeklyReport, 5000);

    const storageHandler = (event) => {
      if (!event.key || event.key.startsWith("emotion") || event.key.startsWith("emotionRewardsState_")) {
        loadWeeklyReport();
      }
    };

    window.addEventListener("storage", storageHandler);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", storageHandler);
    };
  }, []);

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#0b1220',
        scale: 2,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('weekly-emotion-report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
    setIsGeneratingPDF(false);
  };

  if (!weeklyData) {
    return (
      <div className="weekly-reports-container">
        <div className="loading-skeleton">
          <div className="skeleton-header"></div>
          <div className="skeleton-cards"></div>
          <div className="skeleton-chart"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="weekly-reports-container" ref={reportRef}>
      {/* Header */}
      <motion.div
        className="reports-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-content">
          <div>
            <h1>Weekly Reports</h1>
            <p>AI-powered emotional wellness insights</p>
          </div>
          <motion.button
            className="download-btn"
            onClick={generatePDF}
            disabled={isGeneratingPDF}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download size={20} />
            {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
          </motion.button>
        </div>
      </motion.div>

      {/* Key Metrics Cards */}
      <motion.div
        className="metrics-grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <motion.div
          className="metric-card best-day"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="metric-icon">
            <Award size={24} />
          </div>
          <div className="metric-content">
            <h3>Best Day</h3>
            <p className="metric-value">{weeklyData.bestDay.day}</p>
            <p className="metric-desc">{weeklyData.bestDay.score}% - {weeklyData.bestDay.reason}</p>
          </div>
        </motion.div>

        <motion.div
          className="metric-card stress-day"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="metric-icon">
            <TrendingDown size={24} />
          </div>
          <div className="metric-content">
            <h3>Most Frequent Emotion</h3>
            <p className="metric-value">{weeklyData.mostFrequentEmotion.emotion}</p>
            <p className="metric-desc">{weeklyData.mostFrequentEmotion.percentage}% of entries</p>
          </div>
        </motion.div>

        <motion.div
          className="metric-card stable-day"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="metric-icon">
            <Target size={24} />
          </div>
          <div className="metric-content">
            <h3>Weekly Average Mood</h3>
            <p className="metric-value">{weeklyData.weeklyAverageMood}%</p>
            <p className="metric-desc">Success rate: {weeklyData.successRate}% based on recent emotion history</p>
          </div>
        </motion.div>

        <motion.div
          className="metric-card comparison"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="metric-icon">
            <TrendingUp size={24} />
          </div>
          <div className="metric-content">
            <h3>Total Entries</h3>
            <p className="metric-value">{weeklyData.totalEntries}</p>
            <p className="metric-desc">Emotion captures stored this week</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Charts Section */}
      <motion.div
        className="charts-section"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="chart-card">
          <h3>Daily Mood Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData.dailyBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(17, 24, 39, 0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="happiness" fill="#22c55e" name="Happiness %" />
              <Bar dataKey="stress" fill="#ef4444" name="Stress %" />
              <Bar dataKey="productivity" fill="#3b82f6" name="Productivity %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Mood Trends Over Week</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData.dailyBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(17, 24, 39, 0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="averageConfidence"
                stroke="#22c55e"
                strokeWidth={3}
                name="Confidence"
              />
              <Line
                type="monotone"
                dataKey="positiveMoodScore"
                stroke="#3b82f6"
                strokeWidth={3}
                name="Positive Mood"
              />
              <Line
                type="monotone"
                dataKey="negativeMoodScore"
                stroke="#ef4444"
                strokeWidth={3}
                name="Negative Mood"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Insights Section */}
      <motion.div
        className="insights-section"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <h3>AI Insights & Recommendations</h3>
        <div className="insights-grid">
          {weeklyData.insights.map((insight, index) => (
            <motion.div
              key={index}
              className="insight-card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="insight-icon">💡</div>
              <p>{insight}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Scores Overview */}
      <motion.div
        className="scores-overview"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <h3>Overall Scores</h3>
        <div className="scores-grid">
          <div className="score-item">
            <div className="score-circle">
              <div className="score-value">{weeklyData.weeklyAverageMood}%</div>
              <div className="score-label">Happiness</div>
            </div>
          </div>
          <div className="score-item">
            <div className="score-circle">
              <div className="score-value">{Math.min(100, Math.max(0, weeklyData.weeklyAverageMood + 10))}%</div>
              <div className="score-label">Productivity</div>
            </div>
          </div>
          <div className="score-item">
            <div className="score-circle">
              <div className="score-value">{Math.max(0, 100 - weeklyData.weeklyAverageMood)}%</div>
              <div className="score-label">Calmness</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WeeklyReports;