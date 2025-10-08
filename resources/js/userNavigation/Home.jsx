import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/usernav/Home.css";

const Home = () => {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    // Fetch reservation data from Laravel API
    axios
      .get("http://localhost:8000/api/reservations")
      .then((res) => {
        setReservations(res.data);
      })
      .catch((err) => {
        console.error("Error fetching reservations:", err);
      });
  }, []);

  return (
    <div className="home-container">
      {/* Header Section (User top-right only) */}
      <div className="dashboard-header">
        <div className="header-right">
          <div className="user-profile-top">
            <img
              src="/images/user-avatar.png"
              alt="User Avatar"
              className="user-avatar"
            />
            <span className="user-name">Alex</span>
          </div>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="welcome-section">
        <h3>Welcome back, Alex!</h3>
        <p>Here’s an overview of your upcoming events</p>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {/* Upcoming Events */}
        <div className="upcoming-events">
          <h4>Upcoming Events</h4>
          {reservations.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Venue</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((res) => (
                  <tr key={res.id}>
                    <td>{res.event_name}</td>
                    <td>{res.service}</td>
                    <td>{new Date(res.date).toLocaleDateString()}</td>
                    <td>{res.venue}</td>
                    <td>
                      <span className={`status ${res.status.toLowerCase()}`}>
                        {res.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No upcoming reservations yet.</p>
          )}
        </div>

        {/* Reservation Form */}
        <div className="reservation-form">
          <h4>Make a Reservation</h4>
          <form>
            <label>Event Name</label>
            <input type="text" placeholder="Enter event name" />

            <label>Service</label>
            <select>
              <option>Sound Package</option>
              <option>Lighting Package</option>
            </select>

            <label>Venue</label>
            <input type="text" placeholder="Enter venue" />

            <label>Date</label>
            <input type="date" />

            <label>Address</label>
            <input type="text" placeholder="Enter address" />

            <label>Down Payment</label>
            <input type="text" placeholder="Enter down payment" />

            <div className="upload-box">
              <p>Upload Image / Receipt</p>
              <input type="file" />
            </div>

            <button type="submit" className="reserve-btn">
              Reserve Now
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;
