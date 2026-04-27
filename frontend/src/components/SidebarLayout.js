import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  BarChart3,
  FileText,
  MessageCircle,
  Trophy,
  Target,
  TrendingUp,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import "./SidebarLayout.css";

const SidebarLayout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/mood-tracker", label: "Mood Tracker", icon: BarChart3 },
    { path: "/weekly-reports", label: "Weekly Reports", icon: FileText },
    { path: "/chat-assistant", label: "Chat Assistant", icon: MessageCircle },
    { path: "/rewards-zone", label: "Rewards Zone", icon: Trophy },
    { path: "/tasks-suggestions", label: "Tasks & Suggestions", icon: Target },
    { path: "/predictions", label: "Predictions", icon: TrendingUp },
    { path: "/profile", label: "Profile", icon: User },
  ];

  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("loggedUser");
    navigate("/");
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="sidebar-layout">
      {/* Sidebar Toggle Button */}
      <motion.button
        className="sidebar-toggle"
        onClick={toggleSidebar}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </motion.button>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
            />

            {/* Sidebar Panel */}
            <motion.div
              className="sidebar-panel"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="sidebar-header">
                <h2>Emotion AI</h2>
                <p>Premium Dashboard</p>
              </div>

              <nav className="sidebar-nav">
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <motion.button
                      key={item.path}
                      className={`sidebar-item ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        navigate(item.path);
                        setIsOpen(false);
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                      {isActive && (
                        <motion.div
                          className="active-indicator"
                          layoutId="activeIndicator"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                      )}
                    </motion.button>
                  );
                })}

                <motion.button
                  className="sidebar-item logout-item"
                  onClick={handleLogout}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: menuItems.length * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </motion.button>
              </nav>

              {/* User Info */}
              <div className="sidebar-footer">
                <div className="user-info">
                  <div className="user-avatar">👤</div>
                  <div className="user-details">
                    <p className="user-name">
                      {localStorage.getItem("loggedUser") || "User"}
                    </p>
                    <p className="user-status">Premium Member</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        className={`main-content ${isOpen ? 'sidebar-open' : ''}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default SidebarLayout;