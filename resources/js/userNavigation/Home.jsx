import React from "react";
import "../../css/usernav/Home.css";

const Home = () => {
  return (
    <div className="dashboard-container">
      <p className="dashboard-subtitle">
        Welcome! Here's an overview of your event activities.
      </p>

      <div className="dashboard-sections">
        <div className="dashboard-box">
          <h3>Upcoming Events</h3>
          <p>No events yet.</p>
        </div>

        <div className="dashboard-box">
          <h3>Make a Reservation</h3>
          <p>No reservation form yet.</p>
        </div>

        <div className="dashboard-box">
          <h3>Notifications</h3>
          <p>No notifications yet.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
