const NOTIFICATION_STORAGE_PREFIX = "emotionNotifications_";
const DEFAULT_USER = "guest";

const getNotificationStorageKey = (username = DEFAULT_USER) => {
  const safeName = username || DEFAULT_USER;
  return `${NOTIFICATION_STORAGE_PREFIX}${safeName}`;
};

const parseJson = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export const getNotifications = (username = DEFAULT_USER) => {
  const raw = localStorage.getItem(getNotificationStorageKey(username));
  const notifications = parseJson(raw, []);
  return notifications
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const saveNotifications = (notifications, username = DEFAULT_USER) => {
  const key = getNotificationStorageKey(username);
  localStorage.setItem(key, JSON.stringify(notifications));
  return notifications;
};

export const getUnreadCount = (username = DEFAULT_USER) => {
  return getNotifications(username).filter((notification) => !notification.read).length;
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const createNotification = (
  notification,
  username = DEFAULT_USER
) => {
  try {
    const allNotifications = getNotifications(username);
    const now = new Date().toISOString();
    const dedupeKey = notification.dedupeKey;

    if (dedupeKey) {
      const existing = allNotifications.find((item) => item.dedupeKey === dedupeKey);
      if (existing) {
        return existing;
      }
    } else {
      const duplicate = allNotifications.find((item) =>
        item.title === notification.title &&
        item.message === notification.message &&
        item.type === notification.type &&
        Math.abs(new Date(item.created_at).getTime() - new Date(now).getTime()) < 1000 * 60 * 10
      );
      if (duplicate) {
        return duplicate;
      }
    }

    const newNotification = {
      id: notification.id || generateId(),
      title: notification.title || "Update",
      message: notification.message || "You have a new notification.",
      type: notification.type || "info",
      icon: notification.icon,
      read: notification.read || false,
      created_at: notification.created_at || now,
      timestamp: notification.timestamp || Date.now(),
      dedupeKey,
    };

    const updated = [newNotification, ...allNotifications];
    saveNotifications(updated, username);
    window.dispatchEvent(new Event("notification-update"));
    return newNotification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

export const markNotificationRead = (id, username = DEFAULT_USER) => {
  const notifications = getNotifications(username);
  const updated = notifications.map((notification) =>
    notification.id === id ? { ...notification, read: true } : notification
  );
  saveNotifications(updated, username);
  window.dispatchEvent(new Event("notification-update"));
  return updated;
};

export const markAllNotificationsRead = (username = DEFAULT_USER) => {
  const notifications = getNotifications(username);
  const updated = notifications.map((notification) => ({ ...notification, read: true }));
  saveNotifications(updated, username);
  window.dispatchEvent(new Event("notification-update"));
  return updated;
};

export const clearNotifications = (username = DEFAULT_USER) => {
  const key = getNotificationStorageKey(username);
  localStorage.removeItem(key);
  window.dispatchEvent(new Event("notification-update"));
  return [];
};

export const ensureDailyReminder = (username = DEFAULT_USER) => {
  const todayKey = new Date().toISOString().slice(0, 10);
  return createNotification(
    {
      title: "Daily Reminder",
      message: "Remember to log your mood and check in with Emotion AI today.",
      type: "reminder",
      icon: "⏰",
      dedupeKey: `daily-reminder-${todayKey}`,
    },
    username
  );
};

export const ensureWeeklyReportReadyNotification = (
  username = DEFAULT_USER,
  weekKey,
  extraMessage
) => {
  if (!weekKey) return null;
  return createNotification(
    {
      title: "Weekly Report Ready",
      message: extraMessage || "Your weekly emotion report is ready to review.",
      type: "report",
      icon: "📊",
      dedupeKey: `weekly-report-ready-${weekKey}`,
    },
    username
  );
};

export const ensurePredictionUpdatedNotification = (
  username = DEFAULT_USER,
  key,
  extraMessage
) => {
  if (!key) return null;
  return createNotification(
    {
      title: "Prediction Updated",
      message: extraMessage || "Your mood prediction has been updated based on the latest entries.",
      type: "info",
      icon: "🔮",
      dedupeKey: `prediction-updated-${key}`,
    },
    username
  );
};
