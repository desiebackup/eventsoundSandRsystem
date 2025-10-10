import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/usernav/Home.css";
import userAvatar from "../../img/avatar.png";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:8000";

const Home = () => {
  const [reservations, setReservations] = useState([]);
  const [user, setUser] = useState({ name: "Guest" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // ✅ Fetch user info
    axios
      .get("/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch((err) => console.error("Error fetching user:", err));

    // ✅ Fetch reservations
    axios
      .get("/api/reservations", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (Array.isArray(res.data)) {
          setReservations(res.data);
        } else {
          console.warn("Unexpected response:", res.data);
          setReservations([]);
        }
      })
      .catch((err) => console.error("Error fetching reservations:", err));
  }, []);

  return (
    <div className="home-container">
      {/* ===== Welcome Section ===== */}
      <div className="welcome-section">
        <h3>
          Hello, <span className="highlight-name">{user.name}!</span>
        </h3>
        <p>Here’s an overview of your upcoming events</p>
      </div>

      {/* ===== Dashboard Content ===== */}
      <div className="dashboard-content">
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
      </div>
    </div>
  );
};

export default Home;
