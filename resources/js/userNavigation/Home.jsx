import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/usernav/Home.css";
import userAvatar from "../../img/avatar.png"; // ✅ Correct image import

axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:8000";

const Home = () => {
  const [reservations, setReservations] = useState([]);
  const [user, setUser] = useState({ name: "Guest" });

  useEffect(() => {
    // ✅ Fetch user info
    axios
      .get("/api/user")
      .then((res) => setUser(res.data))
      .catch((err) => console.error("Error fetching user:", err));

    // ✅ Fetch reservation data from Laravel API
    axios
      .get("/api/reservations")
      .then((res) => setReservations(res.data))
      .catch((err) => console.error("Error fetching reservations:", err));
  }, []);

  return (
    <div className="home-container">
      {/* ===== Header Section ===== */}
      <div className="dashboard-header">
        <div className="header-right">
          <div className="user-profile-top">
            <img src={userAvatar} alt="User Avatar" className="user-avatar" />
            <span className="user-name">{user.name}</span>
          </div>
        </div>
      </div>

      {/* ===== Welcome Section ===== */}
      <div className="welcome-section">
        <h3>
          Hello, <span className="highlight-name">{user.name}!</span>
        </h3>
        <p>Here’s an overview of your upcoming events</p>
      </div>

      {/* ===== Dashboard Content ===== */}
      <div className="dashboard-content">
        {/* ✅ Upcoming Events Table */}
        <div className="upcoming-events">
          <h4>Upcoming Events</h4>
          {reservations.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Service Package</th>
                  <th>Venue</th>
                  <th>Address</th>
                  <th>Call Time</th>
                  <th>Down Payment</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((res) => (
                  <tr key={res.id}>
                    <td>{res.event_name}</td>
                    <td>{res.service_package}</td>
                    <td>{res.venue}</td>
                    <td>{res.address}</td>
                    <td>{res.call_time}</td>
                    <td>
                      {res.down_payment ? (
                        <img
                          src={`http://localhost:8000/storage/${res.down_payment}`}
                          alt="Down Payment"
                          className="downpayment-img"
                        />
                      ) : (
                        "N/A"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No upcoming reservations yet.</p>
          )}
        </div>

        {/* ===== Reservation Form ===== */}
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

            <label>Address</label>
            <input type="text" placeholder="Enter address" />

            <label>Call Time</label>
            <input type="time" />

            <label>Down Payment (Image)</label>
            <input type="file" />

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
