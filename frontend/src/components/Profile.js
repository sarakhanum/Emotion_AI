import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

  useEffect(() => {
    if (!loggedUser || !loggedUser.email) {
      navigate("/");
    }
  }, [loggedUser, navigate]);

  const storageKey = `profile_${loggedUser?.email}`;

  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
  });

  const [isExisting, setIsExisting] = useState(false);
  const [error, setError] = useState("");

  // Load profile for current user only
  useEffect(() => {
    if (!loggedUser?.email) return;

    const saved = localStorage.getItem(storageKey);

    if (saved) {
      const data = JSON.parse(saved);
      setProfile(data);
      setIsExisting(true);
    } else {
      // New user gets blank form
      setProfile({
        fullName: "",
        email: loggedUser.email,
        phone: "",
        gender: "",
      });
      setIsExisting(false);
    }

    setError("");
  }, [loggedUser?.email, storageKey]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 10) return;

      setProfile({ ...profile, phone: value });

      if (value.length > 0 && value.length < 10) {
        setError("Phone number must be exactly 10 digits");
      } else {
        setError("");
      }
      return;
    }

    setProfile({ ...profile, [name]: value });
  };

  const saveProfile = () => {
    if (profile.phone.length !== 10) {
      alert("Phone number must be exactly 10 digits");
      return;
    }

    localStorage.setItem(storageKey, JSON.stringify(profile));
    alert(isExisting ? "Profile Updated!" : "Profile Saved!");
    setIsExisting(true);
    navigate("/dashboard");
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h2>User Profile</h2>

        <input
          name="fullName"
          placeholder="Full Name"
          value={profile.fullName}
          onChange={handleChange}
        />

        
         <input
          name="Email"
          placeholder="Email"
          value={profile.Email}
          onChange={handleChange}
        />

        <input
          name="phone"
          placeholder="Phone Number"
          value={profile.phone}
          onChange={handleChange}
        />

        {error && (
          <p style={{ color: "red", fontSize: "12px" }}>
            {error}
          </p>
        )}

        <select
          name="gender"
          value={profile.gender}
          onChange={handleChange}
        >
          <option value="">Select Gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>

        <button onClick={saveProfile}>
          {isExisting ? "Update Profile" : "Save Profile"}
        </button>

        <button onClick={() => navigate("/dashboard")}>
          Back
        </button>
      </div>
    </div>
  );
}

export default Profile;