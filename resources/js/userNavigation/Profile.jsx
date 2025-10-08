import React from "react";
import "../../css/usernav/Profile.css";

const Profile = () => {
  return (
    <div className="profile-container">
      <h1>My Profile</h1>

      <div className="profile-card">
        <img src="/images/default-avatar.png" alt="Profile" className="profile-avatar" />

        <div className="profile-info">
          <h2>Jane Doe</h2>
          <p>Email: jane@example.com</p>
          <p>Contact: +63 912 345 6789</p>
          <p>Member since: January 2025</p>

          <button className="edit-btn">Edit Profile</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
