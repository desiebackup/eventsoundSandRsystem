import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/adminnav/ManageReservations.css";

export default function ManageReservations() {
  const [reservations, setReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);

  useEffect(() => {
    axios
      .get("/api/reservations")
      .then((res) => setReservations(res.data))
      .catch(() => setReservations([]));
  }, []);

  const handleApprove = async (id) => {
    if (!confirm("Approve this reservation?")) return;
    try {
      const res = await axios.post(`/api/admin/reservations/${id}/approve`);
      setReservations((r) => r.map((rs) => (rs.id === id ? res.data : rs)));
    } catch (e) {
      console.error(e);
      alert("Failed to approve");
    }
  };

  const handleDecline = async (id) => {
    if (!confirm("Decline this reservation?")) return;
    try {
      const res = await axios.post(`/api/admin/reservations/${id}/decline`);
      setReservations((r) => r.map((rs) => (rs.id === id ? res.data : rs)));
    } catch (e) {
      console.error(e);
      alert("Failed to decline");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this reservation?")) return;
    try {
      await axios.delete(`/api/reservations/${id}`);
      setReservations((r) => r.filter((rs) => rs.id !== id));
    } catch (e) {
      console.error(e);
      alert("Failed to delete");
    }
  };

  return (
    <div className="admin-page">

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Event Name</th>
            <th>Client</th>
            <th>Date</th>
            <th>Call Time</th>
            <th>Service Package</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {reservations.map((resv) => (
            <tr key={resv.id}>
              <td>{resv.id}</td>
              <td>{resv.event_name}</td>
              <td>
                {resv.user
                  ? `${resv.user.firstname || ""} ${resv.user.lastname || ""}`
                  : "Unknown"}
              </td>
              <td>{resv.call_date ? new Date(resv.call_date).toLocaleDateString() : "TBD"}</td>
              <td>{resv.call_time || "TBD"}</td>
              <td>{resv.service?.name || "N/A"}</td>
              <td>
                <span className={`status ${resv.status}`}>{resv.status}</span>
              </td>
              <td>
                <button
                  className="btn-view"
                  onClick={() => setSelectedReservation(resv)}
                >
                  View
                </button>
                {resv.status === "pending" && (
                  <>
                    <button
                      className="btn-approve"
                      onClick={() => handleApprove(resv.id)}
                    >
                      Approve
                    </button>
                    <button
                      className="btn-decline"
                      onClick={() => handleDecline(resv.id)}
                    >
                      Decline
                    </button>
                  </>
                )}
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(resv.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* VIEW MODAL */}
      {selectedReservation && (
        <div className="modal-overlay">
          <div className="modal-card">
            <button
              className="close-btn"
              onClick={() => setSelectedReservation(null)}
            >
              ✕
            </button>

            <h3>Reservation Details</h3>
            <div className="modal-details">
              <p><strong>Event Name:</strong> {selectedReservation.event_name}</p>
              <p><strong>Event Type:</strong> {selectedReservation.event_type}</p>
              <p><strong>Venue Type:</strong> {selectedReservation.venue_type}</p>
              <p><strong>Client:</strong> {selectedReservation.user?.firstname} {selectedReservation.user?.lastname}</p>
              <p><strong>Date:</strong> {selectedReservation.call_date}</p>
              <p><strong>Call Time:</strong> {selectedReservation.call_time}</p>
              <p><strong>Start Time:</strong> {selectedReservation.start_time}</p>
              <p><strong>End Time:</strong> {selectedReservation.end_time}</p>
              <p><strong>Phone:</strong> {selectedReservation.phone}</p>
              <p>
                <strong>Location:</strong>{" "}
                {`${selectedReservation.purok}, ${selectedReservation.barangay}, ${selectedReservation.city}, ${selectedReservation.province}`}
              </p>
              <p>
                <strong>Down Payment:</strong>{" "}
                {selectedReservation.down_payment ? (
                  <a
                    href={`/storage/${selectedReservation.down_payment}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {selectedReservation.down_payment.split("/").pop()}
                  </a>
                ) : (
                  "No file uploaded"
                )}
              </p>
              <p><strong>Service Package:</strong> {selectedReservation.service?.name}</p>
              <p><strong>Status:</strong> {selectedReservation.status}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
