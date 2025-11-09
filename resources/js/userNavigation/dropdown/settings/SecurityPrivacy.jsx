import React, { useState } from "react";
import axios from "axios";
import "../../../../css/usernav/dropdown/settings/SecurityPrivacy.css";

const SecurityPrivacy = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  axios.defaults.withCredentials = true;
  axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

  const handleSubmit = async (e) => {
    e.preventDefault();

    // === Validation ===
    if (!currentPassword || !newPassword) {
      setMessage({ type: "error", text: "Please fill in both password fields." });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({
        type: "error",
        text: "Your new password must be at least 8 characters long.",
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await axios.post("/api/user/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });

      setMessage({
        type: "success",
        text: res.data.message || "Password updated successfully!",
      });

      // Reset fields
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      console.error("Password update failed:", err);
      if (err.response?.status === 422) {
        setMessage({
          type: "error",
          text: err.response.data.error || "Current password is incorrect.",
        });
      } else {
        setMessage({
          type: "error",
          text: "Something went wrong. Please try again later.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="security-container">
      <h2>Security and Privacy</h2>
      <hr />

      <p className="security-description">
        Modify your password to ensure continued protection of your account.
      </p>

      <div className="security-box">
        <h3>Change Password</h3>

        <form onSubmit={handleSubmit}>
          <label htmlFor="current-password">Current Password</label>
          <input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            required
          />

          <label htmlFor="new-password">New Password</label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            required
          />

          {message.text && (
            <p className={`message ${message.type}`}>
              {message.text}
            </p>
          )}

          <button
            type="submit"
            className="security-btn"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SecurityPrivacy;