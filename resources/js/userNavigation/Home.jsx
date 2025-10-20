import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/usernav/Home.css";
import userAvatar from "../../img/avatar.png";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:8000";

const Home = () => {
  const [reservations, setReservations] = useState([]);
  const [user, setUser] = useState({ name: "Guest" });
  const [selectedDownPayment, setSelectedDownPayment] = useState(null);

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

      {/* ===== Dashboard Content ===== */}
      <div className="dashboard-content">
        <div className="upcoming-events">
          <h4>Upcoming Events</h4>
          {reservations.filter(r => r.status === 'approved').length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Service Package</th>
                  <th>Venue</th>
                  <th>Address</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Down Payment</th>
                </tr>
              </thead>
              <tbody>
                {reservations.filter(r => r.status === 'approved').map((res) => (
                  <tr key={res.id}>
                    <td>{res.event_name}</td>
                    <td>{res.service_package}</td>
                    <td>{res.venue}</td>
                    <td>{res.address}</td>
                    {(() => {
                      const dt = res.call_time ? new Date(res.call_time) : null;
                      const dateStr = dt && !isNaN(dt) ? dt.toLocaleDateString() : '—';
                      const timeStr = dt && !isNaN(dt) ? dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
                      return (
                        <>
                          <td>{dateStr}</td>
                          <td>{timeStr}</td>
                        </>
                      );
                    })()}
                    <td>
                      {res.down_payment ? (
                        // open an in-page modal to view the image; closing returns to Home
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedDownPayment(res.down_payment);
                          }}
                        >
                          {res.down_payment}
                        </a>
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
      {/* Down payment modal */}
      {selectedDownPayment && (
        <div className="dp-modal-overlay">
          <div className="dp-modal">
            <div className="dp-modal-header">
              <h4>Down Payment</h4>
              <button className="dp-close-btn" onClick={() => setSelectedDownPayment(null)}>Close</button>
            </div>
            <div className="dp-modal-body">
              <img
                src={`http://localhost:8000/storage/${selectedDownPayment}`}
                alt="Down Payment"
                className="dp-modal-img"
              />
              <p className="dp-filename">{selectedDownPayment}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
