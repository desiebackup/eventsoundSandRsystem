import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/adminnav/ManageReservations.css";

export default function ManageReservations() {
  const [reservations, setReservations] = useState([]);

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

  return (
    <div className="admin-page">

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Event Name</th>
            <th>Client</th>
            <th>Date</th>
            <th>Time</th>
            <th>Venue</th>
            <th>Down Payment</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((resv) => (
            <tr key={resv.id}>
              <td>{resv.id}</td>
              <td>{resv.event_name}</td>
              <td>{resv.user?.firstname} {resv.user?.lastname}</td>
              <td>{resv.call_time ? new Date(resv.call_time).toLocaleDateString() : 'TBD'}</td>
              <td>{resv.call_time ? new Date(resv.call_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}</td>
              <td>{resv.venue}</td>
              <td>
                {resv.down_payment ? (
                  <a href={`/storage/${resv.down_payment}`} target="_blank" rel="noreferrer">View</a>
                ) : (
                  <span>No payment</span>
                )}
              </td>
              <td><span className={`status ${resv.status}`}>{resv.status}</span></td>
              <td>
                {resv.status === 'pending' ? (
                  <>
                    <button className="btn-approve" onClick={() => handleApprove(resv.id)}>Approve</button>
                    <button className="btn-decline" onClick={() => handleDecline(resv.id)}>Decline</button>
                  </>
                ) : (
                  <span className="muted">No actions</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
