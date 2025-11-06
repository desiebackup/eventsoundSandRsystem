import React, { useState } from "react";
import "../../../../css/usernav/dropdown/settings/SecurityPrivacy.css";

const SecurityPrivacy = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Password updated");
    // your update API call here
  };

  return (
    <div className="security-container">
      <h2>Security and Privacy</h2>
      <hr/>


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
          />

          <label htmlFor="new-password">New Password</label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
          />

          <button type="submit" className="security-btn">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default SecurityPrivacy;