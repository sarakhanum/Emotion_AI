import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 🎭 Animated Emoji State
  const emojis = ["😄", "😢", "😡"];
  const [emojiIndex, setEmojiIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setEmojiIndex((prev) => (prev + 1) % emojis.length);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Enter username and password");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/login/", {
        username,
        password,
      });

      if (res.data.message) {
        localStorage.setItem("loggedIn", "true");

        // ✅ IMPORTANT FIX FOR PROFILE PAGE
        localStorage.setItem(
          "loggedUser",
          JSON.stringify({
            email: username
          })
        );

        navigate("/dashboard");
      } else {
        alert("Invalid credentials");
      }
    } catch (err) {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* 🔥 LEFT PANEL (AI EMOJI 3D STYLE) */}
      <div className="left-panel">

        <div className="emoji-3d">
          {emojis[emojiIndex]}
        </div>

        <h1>Emotion AI</h1>

        <p>
          Detect • Understand • Analyze
        </p>

      </div>

      {/* 🔐 LOGIN CARD */}
      <div className="login-card">

        <div className="icon">🤖</div>

        <h2>Welcome Back</h2>
        <p className="sub">Login to continue</p>

        <input
          type="text"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="footer">
          Don’t have an account?
          <span onClick={() => navigate("/signup")}>
            Sign up
          </span>
        </p>

      </div>

    </div>
  );
}

export default Login;