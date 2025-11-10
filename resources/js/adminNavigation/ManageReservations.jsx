import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/adminnav/ManageReservations.css";

export default function ManageReservations() {
  const [reservations, setReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [refundFile, setRefundFile] = useState(null);
  const [processingRefund, setProcessingRefund] = useState(false);

  // === FETCH RESERVATIONS ===
  useEffect(() => {
    axios
      .get("/api/reservations")
      .then((res) => setReservations(res.data))
      .catch(() => setReservations([]));
  }, []);

  // === SAFE JSON PARSE ===
  const safeParse = (data) => {
    try {
      return typeof data === "string" ? JSON.parse(data) : data || [];
    } catch {
      return [];
    }
  };

// === APPROVE ===
const handleApprove = async (id) => {
  if (!confirm("Approve this reservation?")) return;
  try {
    const res = await axios.post(`/api/admin/reservations/${id}/approve`);
    const updated = res.data.reservation || res.data;
    setReservations((r) => r.map((rs) => (rs.id === id ? updated : rs)));
    // If API returned updated services (primary + custom), broadcast to update Inventory UI immediately
    const updatedServices = res.data.updated_services ?? null;
    if (Array.isArray(updatedServices) && updatedServices.length) {
      try {
        window.dispatchEvent(new CustomEvent('servicesUpdated', { detail: updatedServices }));
      } catch (e) {
        console.warn('Could not dispatch servicesUpdated event', e);
      }
    }
    alert("Reservation approved successfully!");
  } catch (e) {
    console.error(e);
    alert("Failed to approve reservation.");
  }
};

// === DECLINE ===
const handleDecline = async (id) => {
  if (!confirm("Decline this reservation?")) return;
  try {
    const res = await axios.post(`/api/admin/reservations/${id}/decline`);
    const updated = res.data.reservation || res.data;
    setReservations((r) => r.map((rs) => (rs.id === id ? updated : rs)));
    alert("Reservation declined successfully!");
  } catch (e) {
    console.error(e);
    alert("Failed to decline reservation.");
  }
};

  // === DELETE ===
  const handleDelete = async (id) => {
    if (!confirm("Delete this reservation?")) return;
    try {
      await axios.delete(`/api/reservations/${id}`);
      setReservations((r) => r.filter((rs) => rs.id !== id));
    } catch (e) {
      console.error(e);
      alert("Failed to delete reservation.");
    }
  };

  // === COMPUTE TOTALS ===
  const computeTotals = (reservation) => {
    const customs = safeParse(reservation.custom_services);
    let totalPrice = 0;
    let totalDown = 0;

    // Package totals
    if (reservation.service) {
      totalPrice += reservation.service.price || 0;
      totalDown += reservation.service.down_payment || 0;
    }

    // Custom totals
    customs.forEach((c) => {
      totalPrice += (c.price || 0) * (c.quantity || 1);
      totalDown += (c.down_payment || 0) * (c.quantity || 1);
    });

    const balance = totalPrice - totalDown;
    return { totalPrice, totalDown, balance };
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
            <th>Service Type</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {reservations.map((resv) => {
            const hasCustoms = safeParse(resv.custom_services).length > 0;
            return (
              <tr key={resv.id}>
                <td>{resv.id}</td>
                <td>{resv.event_name}</td>
                <td>
                  {resv.user
                    ? `${resv.user.firstname || ""} ${resv.user.lastname || ""}`
                    : "Unknown"}
                </td>
                <td>
                  {resv.call_date
                    ? new Date(resv.call_date).toLocaleDateString()
                    : "TBD"}
                </td>
                <td>{resv.call_time || "TBD"}</td>
                <td>
                  {resv.service?.name && hasCustoms
                    ? `${resv.service.name} + Custom`
                    : resv.service?.name
                    ? resv.service.name
                    : hasCustoms
                    ? "Custom Only"
                    : "N/A"}
                </td>
                <td>
                  <span className={`status ${resv.status}`}>
                    {resv.status}
                  </span>
                </td>
                <td>
                  <button
                    className="view"
                    onClick={() => setSelectedReservation(resv)}
                  >
                    View
                  </button>
                  {resv.status === 'cancelled' && resv.payment && (resv.payment.status !== 'refunded') && (
                    <>
                      <button
                        className="refund"
                        onClick={() => setSelectedReservation(resv)}
                      >
                        Refund
                      </button>
                    </>
                  )}
                  {resv.status === "pending" && (
                    <>
                      <button
                        className="approve"
                        onClick={() => handleApprove(resv.id)}
                      >
                        Approve
                      </button>
                      <button
                        className="decline"
                        onClick={() => handleDecline(resv.id)}
                      >
                        Decline
                      </button>
                    </>
                  )}
                  <button
                    className="delete"
                    onClick={() => handleDelete(resv.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* === VIEW MODAL === */}
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
              <p>
                <strong>Event Name:</strong> {selectedReservation.event_name}
              </p>
              <p>
                <strong>Event Type:</strong> {selectedReservation.event_type}
              </p>
              <p>
                <strong>Venue Type:</strong> {selectedReservation.venue_type}
              </p>
              <p>
                <strong>Client:</strong>{" "}
                {selectedReservation.user
                  ? `${selectedReservation.user.firstname} ${selectedReservation.user.lastname}`
                  : "N/A"}
              </p>
              <p>
                <strong>Date:</strong> {selectedReservation.call_date || "N/A"}
              </p>
              <p>
                <strong>Call Time:</strong>{" "}
                {selectedReservation.call_time || "N/A"}
              </p>
              <p>
                <strong>Start Time:</strong>{" "}
                {selectedReservation.start_time || "N/A"}
              </p>
              <p>
                <strong>End Time:</strong>{" "}
                {selectedReservation.end_time || "N/A"}
              </p>
              <p>
                <strong>Phone:</strong> {selectedReservation.phone || "N/A"}
              </p>
              <p>
                <strong>Location:</strong>{" "}
                {`${selectedReservation.purok || ""}, ${
                  selectedReservation.barangay || ""
                }, ${selectedReservation.city || ""}, ${
                  selectedReservation.province || ""
                }`}
              </p>

              <hr />

              {/* === DOWN PAYMENT === */}
              <p>
                <strong>Down Payment Proof:</strong>{" "}
                {selectedReservation.down_payment ? (
                  <a
                    href={`/storage/${selectedReservation.down_payment}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Proof
                  </a>
                ) : (
                  "No file uploaded"
                )}
              </p>

              <hr />

              {/* === SERVICE PACKAGE === */}
              {selectedReservation.service && (
                <>
                  <h3>Service Package</h3>
                  <p>
                    <strong>Name:</strong> {selectedReservation.service.name}
                  </p>
                  <p>
                    <strong>Price:</strong> ₱{" "}
                    {selectedReservation.service.price?.toLocaleString() || "0"}
                  </p>
                  <p>
                    <strong>Down Payment:</strong> ₱{" "}
                    {selectedReservation.service.down_payment?.toLocaleString() ||
                      "0"}
                  </p>
                </>
              )}

              {/* === CUSTOM SERVICES === */}
              {safeParse(selectedReservation.custom_services).length > 0 && (
                <>
                  <h3>Custom Services</h3>
                  <ul className="custom-service-list">
                    {safeParse(selectedReservation.custom_services).map(
                      (c, i) => (
                        <li key={i}>
                          <strong>{c.name}</strong> × {c.quantity} — ₱
                          {(c.price * c.quantity).toLocaleString()} (Down ₱
                          {(c.down_payment * c.quantity).toLocaleString()})
                        </li>
                      )
                    )}
                  </ul>
                </>
              )}

              {/* === TOTALS === */}
              <hr />
              {(() => {
                const totals = computeTotals(selectedReservation);
                return (
                  <>
                    <h3>Totals</h3>
                    <p>
                      <strong>Total Price:</strong> ₱{" "}
                      {totals.totalPrice.toLocaleString()}
                    </p>
                    <p>
                      <strong>Total Down Payment:</strong> ₱{" "}
                      {totals.totalDown.toLocaleString()}
                    </p>
                    <p>
                      <strong>Remaining Balance:</strong> ₱{" "}
                      {totals.balance.toLocaleString()}
                    </p>
                  </>
                );
              })()}

              <hr />
              <p>
                <strong>Status:</strong>{" "}
                <span className={`status ${selectedReservation.status}`}>
                  {selectedReservation.status}
                </span>
              </p>

              {/* === ADMIN REFUND ACTION FOR CANCELLED RESERVATIONS === */}
              {selectedReservation.status === 'cancelled' && selectedReservation.payment && (
                <div style={{ marginTop: 12 }}>
                  <h4>Admin: Process Refund</h4>
                  <p>If the user cancelled and a payment exists, upload refund receipt and process refund.</p>
                  <input type="file" accept="image/*" onChange={(e) => setRefundFile(e.target.files?.[0] ?? null)} />
                  <div style={{ marginTop: 8 }}>
                    <button
                      className="refund"
                      onClick={async () => {
                        if (!selectedReservation.payment) return alert('No payment record found.');
                        if (!refundFile) return alert('Please choose a refund receipt image.');
                        if (!confirm('Upload refund receipt and mark payment as refunded?')) return;
                        setProcessingRefund(true);
                        try {
                          const fd = new FormData();
                          fd.append('refund_receipt', refundFile);
                          const paymentId = selectedReservation.payment.id;
                          const res = await axios.post(`/api/admin/payments/${paymentId}/refund`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });

                          // update reservations list payment status
                          const updatedPayment = res.data.payment || res.data;
                          setReservations((prev) => prev.map((r) => r.id === selectedReservation.id ? { ...r, payment: updatedPayment } : r));
                          alert('Refund processed successfully.');
                          setRefundFile(null);
                          setSelectedReservation(null);
                        } catch (err) {
                          console.error('Refund failed', err);
                          alert('Refund failed.');
                        } finally {
                          setProcessingRefund(false);
                        }
                      }}
                      disabled={processingRefund}
                    >
                      {processingRefund ? 'Processing…' : 'Confirm Refund'}
                    </button>
                    <button style={{ marginLeft: 8 }} className="delete" onClick={() => setRefundFile(null)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
