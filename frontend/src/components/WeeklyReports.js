import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, TrendingUp, TrendingDown, Calendar, Award, Target } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import jsPDF from "jspdf";
import { getWeeklyReportData, getTomorrowMoodPrediction } from "../utils/emotionStorage";
import { ensureWeeklyReportReadyNotification } from "../utils/notificationStorage";
import "./WeeklyReports.css";

const WeeklyReports = () => {
  const [weeklyData, setWeeklyData] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    const getWeekKey = () => {
      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(now.setDate(diff));
      return weekStart.toISOString().slice(0, 10);
    };

    const loadWeeklyReport = () => {
      const report = getWeeklyReportData();
      setWeeklyData(report);
      if (report.totalEntries > 0) {
        ensureWeeklyReportReadyNotification(
          localStorage.getItem("loggedUser") || "guest",
          getWeekKey(),
          `Your weekly emotion report is ready for ${new Date().toLocaleDateString()}.`
        );
      }
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

  const generatePDF = () => {
    if (!weeklyData) return;
    setIsGeneratingPDF(true);

    try {
      const username = localStorage.getItem("loggedUser") || "Guest";
      const generatedDate = new Date().toLocaleDateString();
      const prediction = getTomorrowMoodPrediction();
      const pdf = new jsPDF("p", "mm", "a4");

      const margin = 18;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const usableWidth = pageWidth - margin * 2;
      let y = 20;

      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.text("Emotion AI Weekly Report", margin, y);

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      y += 8;
      pdf.text(`Username: ${username}`, margin, y);
      pdf.text(`Generated: ${generatedDate}`, pageWidth - margin, y, { align: "right" });

      y += 10;
      pdf.setDrawColor(220);
      pdf.setLineWidth(0.2);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 10;

      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Summary", margin, y);
      y += 8;

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      const summaryRows = [
        `Best mood day: ${weeklyData.bestDay.day}`,
        `Most frequent emotion: ${weeklyData.mostFrequentEmotion.emotion} (${weeklyData.mostFrequentEmotion.percentage}%)`,
        `Weekly average mood: ${weeklyData.weeklyAverageMood}%`,
        `Success rate: ${weeklyData.successRate}%`,
        `Total captures: ${weeklyData.totalEntries}`,
      ];

      summaryRows.forEach((row) => {
        if (y > pageHeight - 60) {
          pdf.addPage();
          y = 20;
        }
        pdf.text(`• ${row}`, margin, y);
        y += 7;
      });

      const days = Array.isArray(weeklyData.dailyBreakdown) ? weeklyData.dailyBreakdown.slice(0, 7) : [];
      const hasChartData = days.some((day) => day.totalCount > 0);

      y += 10;
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Daily Mood Breakdown", margin, y);
      y += 8;

      if (hasChartData) {
        const chartHeight = 70;
        const chartX = margin;
        const chartY = y;
        const chartBottom = chartY + chartHeight;
        const chartLeft = chartX + 24;
        const chartRight = pageWidth - margin;
        const chartInnerWidth = chartRight - chartLeft;
        const chartInnerHeight = chartHeight - 24;

        pdf.setDrawColor(220);
        pdf.rect(chartX, chartY, usableWidth, chartHeight);

        // Draw Y-axis labels
        pdf.setFontSize(7);
        pdf.setTextColor(107, 114, 128);
        [100, 50, 0].forEach((value, index) => {
          const labelY = chartY + 10 + (chartInnerHeight / 2) * index;
          pdf.text(`${value}%`, chartLeft - 6, labelY + 2, { align: "right" });
          pdf.line(chartLeft, labelY, chartRight, labelY, "S");
        });

        const groupWidth = chartInnerWidth / Math.max(days.length, 1);
        const barWidth = Math.min(8, groupWidth * 0.22);
        const series = [
          { key: "happiness", color: [34, 197, 94], label: "Happiness" },
          { key: "stress", color: [239, 68, 68], label: "Stress" },
          { key: "productivity", color: [59, 130, 246], label: "Productivity" },
        ];

        days.forEach((day, index) => {
          const groupX = chartLeft + index * groupWidth;
          series.forEach((serie, serieIndex) => {
            const value = Math.max(0, Math.min(100, day[serie.key] || 0));
            const barHeight = (value / 100) * chartInnerHeight;
            const barX = groupX + serieIndex * (barWidth + 2);
            const barY = chartBottom - 10 - barHeight;

            pdf.setFillColor(...serie.color);
            pdf.rect(barX, barY, barWidth, barHeight, "F");
            pdf.setFontSize(7);
            pdf.setTextColor(17, 24, 39);
            pdf.text(`${value}%`, barX + barWidth / 2, barY - 2, { align: "center" });
          });

          pdf.setFontSize(7);
          pdf.setTextColor(156, 163, 175);
          pdf.text(day.day || "-", groupX + groupWidth / 2, chartBottom + 4, { align: "center" });
        });

        // Legend
        let legendX = chartX;
        const legendY = chartBottom + 14;
        series.forEach((serie, index) => {
          const dotX = legendX + 1;
          pdf.setFillColor(...serie.color);
          pdf.circle(dotX, legendY - 1.5, 2.5, "F");
          pdf.setFontSize(8);
          pdf.setTextColor(17, 24, 39);
          pdf.text(serie.label, dotX + 6, legendY, { align: "left" });
          legendX += 40;
        });

        y += chartHeight + 22;
      } else {
        pdf.setFontSize(11);
        pdf.setTextColor(110, 110, 110);
        pdf.text("No sufficient data for chart", margin, y);
        y += 18;
      }

      if (y > pageHeight - 90) {
        pdf.addPage();
        y = 20;
      }

      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Weekly Mood Trend", margin, y);
      y += 8;

      if (hasChartData) {
        const trendHeight = 70;
        const trendX = margin;
        const trendY = y;
        const trendLeft = trendX + 24;
        const trendRight = pageWidth - margin;
        const trendBottom = trendY + trendHeight - 14;
        const trendInnerWidth = trendRight - trendLeft;
        const trendInnerHeight = trendHeight - 24;

        pdf.setDrawColor(220);
        pdf.rect(trendX, trendY, usableWidth, trendHeight);

        pdf.setFontSize(7);
        pdf.setTextColor(107, 114, 128);
        [100, 50, 0].forEach((value, index) => {
          const labelY = trendY + 10 + (trendInnerHeight / 2) * index;
          pdf.text(`${value}%`, trendLeft - 6, labelY + 2, { align: "right" });
          pdf.line(trendLeft, labelY, trendRight, labelY, "S");
        });

        const series = [
          { key: "averageConfidence", color: [34, 197, 94], label: "Confidence" },
          { key: "positiveMoodScore", color: [59, 130, 246], label: "Positive Mood" },
          { key: "negativeMoodScore", color: [239, 68, 68], label: "Negative Mood" },
        ];

        const xStep = days.length > 1 ? trendInnerWidth / (days.length - 1) : 0;
        const pointSets = series.map((serie) => {
          return days.map((day, index) => {
            const value = Math.max(0, Math.min(100, day[serie.key] || 0));
            return {
              x: trendLeft + index * xStep,
              y: trendBottom - (value / 100) * trendInnerHeight,
              value,
            };
          });
        });

        series.forEach((serie, serieIndex) => {
          const points = pointSets[serieIndex];
          pdf.setDrawColor(...serie.color);
          pdf.setLineWidth(1.5);
          points.forEach((point, index) => {
            if (index > 0) {
              const previous = points[index - 1];
              pdf.line(previous.x, previous.y, point.x, point.y);
            }
          });
          points.forEach((point) => {
            pdf.setFillColor(...serie.color);
            pdf.circle(point.x, point.y, 1.8, "F");
          });
        });

        days.forEach((day, index) => {
          const labelX = trendLeft + index * xStep;
          pdf.setFontSize(7);
          pdf.setTextColor(156, 163, 175);
          pdf.text(day.day || "-", labelX, trendBottom + 10, { align: "center" });
        });

        let legendX = trendX;
        const legendY = trendBottom + 18;
        series.forEach((serie) => {
          const dotX = legendX + 1;
          pdf.setFillColor(...serie.color);
          pdf.circle(dotX, legendY - 1.5, 2.5, "F");
          pdf.setFontSize(8);
          pdf.setTextColor(17, 24, 39);
          pdf.text(serie.label, dotX + 6, legendY, { align: "left" });
          legendX += 45;
        });

        y += trendHeight + 22;
      } else {
        pdf.setFontSize(11);
        pdf.setTextColor(110, 110, 110);
        pdf.text("No sufficient data for chart", margin, y);
        y += 18;
      }

      if (y > pageHeight - 90) {
        pdf.addPage();
        y = 20;
      }

      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Insights", margin, y);
      y += 10;

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      weeklyData.insights.forEach((insight) => {
        if (y > pageHeight - 40) {
          pdf.addPage();
          y = 20;
        }
        pdf.text(`• ${insight}`, margin, y, { maxWidth: usableWidth });
        y += 7;
      });

      y += 10;
      if (y > pageHeight - 90) {
        pdf.addPage();
        y = 20;
      }

      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Tomorrow's Prediction", margin, y);
      y += 8;

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Mood: ${prediction.mood || "Neutral"}`, margin, y);
      y += 6;
      pdf.text(`Confidence: ${prediction.confidence || 0}%`, margin, y);
      y += 6;
      pdf.text(`Reason: ${prediction.reason || "Based on your weekly emotion report."}`, margin, y, {
        maxWidth: usableWidth,
      });

      y += 12;
      if (y > pageHeight - 30) {
        pdf.addPage();
        y = 20;
      }

      pdf.setFontSize(10);
      pdf.setTextColor(110, 110, 110);
      pdf.text("Generated by Emotion AI", margin, pageHeight - 12);

      pdf.save("weekly-emotion-report.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
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
    <div className="weekly-reports-container">
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