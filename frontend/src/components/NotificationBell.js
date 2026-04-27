import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";
import axios from "axios";
import "./NotificationBell.css";

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const username = localStorage.getItem("loggedUser");
      const response = await axios.get(`http://127.0.0.1:8000/api/notifications/?username=${username}`);

      if (response.data && response.data.notifications) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unread_count || 0);
      }
    } catch (error) {
      console.log("Error fetching notifications:", error);
      // Fallback to empty notifications
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Mark as read when opening
      setUnreadCount(0);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'achievement':
        return '🏆';
      case 'report':
        return '📊';
      default:
        return '🔔';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInHours = Math.floor((now - notificationTime) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return notificationTime.toLocaleDateString();
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      {/* Bell Button */}
      <motion.button
        className="notification-bell-btn"
        onClick={toggleDropdown}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <motion.span
            className="notification-badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="notification-dropdown"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="notification-header">
              <h4>Notifications</h4>
              <button
                className="close-btn"
                onClick={() => setIsOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            {/* Notifications List */}
            <div className="notification-list">
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id || index}
                    className={`notification-item ${notification.type}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="notification-icon">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-content">
                      <p className="notification-message">{notification.message}</p>
                      <span className="notification-time">
                        {formatTimeAgo(notification.created_at)}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="no-notifications">
                  <Bell size={32} />
                  <p>No notifications yet</p>
                  <span>We'll notify you when there are updates!</span>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="notification-footer">
                <button
                  className="mark-read-btn"
                  onClick={() => setUnreadCount(0)}
                >
                  Mark all as read
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;