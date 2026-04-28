import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
  ensureDailyReminder,
} from "../utils/notificationStorage";
import "./NotificationBell.css";

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const dropdownRef = useRef(null);

  const username = localStorage.getItem("loggedUser") || "guest";

  const loadNotifications = () => {
    const list = getNotifications(username);
    setNotifications(list);
    setUnreadCount(getUnreadCount(username));
  };

  useEffect(() => {
    loadNotifications();
    ensureDailyReminder(username);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleUpdate = () => loadNotifications();

    window.addEventListener("storage", handleUpdate);
    window.addEventListener("notification-update", handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("notification-update", handleUpdate);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen((current) => !current);
  };

  const handleMarkAsRead = (id) => {
    const updated = markNotificationRead(id, username);
    setNotifications(updated);
    setUnreadCount(updated.filter((notification) => !notification.read).length);
  };

  const handleMarkAllAsRead = () => {
    const updated = markAllNotificationsRead(username);
    setNotifications(updated);
    setUnreadCount(0);
  };

  const handleClearAll = () => {
    clearNotifications(username);
    setNotifications([]);
    setUnreadCount(0);
  };

  const visibleNotifications = showUnreadOnly
    ? notifications.filter((notification) => !notification.read)
    : notifications;

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
              <div>
                <h4>Notifications</h4>
                <span className="notification-subtitle">{unreadCount} unread</span>
              </div>
              <div className="notification-header-actions">
                <button
                  className="notification-filter-btn"
                  onClick={() => setShowUnreadOnly((prev) => !prev)}
                >
                  {showUnreadOnly ? "Show all" : "Unread only"}
                </button>
                <button
                  className="close-btn"
                  onClick={() => setIsOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="notification-list">
              {visibleNotifications.length > 0 ? (
                visibleNotifications.map((notification, index) => (
                  <motion.div
                    key={notification.id || index}
                    className={`notification-item ${notification.type} ${notification.read ? "read" : "unread"}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="notification-icon">
                      {notification.icon || getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-content">
                      <p className="notification-title">{notification.title}</p>
                      <p className="notification-message">{notification.message}</p>
                      <span className="notification-time">
                        {formatTimeAgo(notification.created_at)}
                      </span>
                    </div>
                    {!notification.read && (
                      <button
                        className="notification-action-btn"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        Mark as Read
                      </button>
                    )}
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
                  onClick={handleMarkAllAsRead}
                >
                  Mark all as read
                </button>
                <button
                  className="mark-clear-btn"
                  onClick={handleClearAll}
                >
                  Clear All
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