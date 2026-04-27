import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const register = async () => {
    if (!username || !password) {
      alert("Enter all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/signup/",
        { username, password }
      );

      if (res.data.message) {
        alert("Account created successfully");
        navigate("/");
      } else {
        alert(res.data.error || "Signup failed");
      }
    } catch (error) {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* 🔥 LEFT PANEL (NO 3D ORB — SAME SYSTEM STYLE) */}
      <div className="left-panel">

        <div className="emoji-3d">
          🧠
        </div>

        <h1>Emotion AI</h1>

        <p>
          Join the AI system and experience real-time emotion detection
        </p>

      </div>

      {/* SIGNUP CARD */}
      <div className="login-card">

        <h2>Create Account</h2>
        <p className="sub">Sign up to continue</p>

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

        <button onClick={register} disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </button>

        <p className="footer">
          Already have an account?
          <span onClick={() => navigate("/")}>
            Login
          </span>
        </p>

      </div>

    </div>
  );
}

export default Signup;