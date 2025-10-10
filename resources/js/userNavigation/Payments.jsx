// resources/js/userNavigation/Payments.jsx
import React from "react";

export default function Payments() {
  return (
    <div className="page-card">
      <h2>Payment History</h2>
      <p className="muted">All your transactions and receipts.</p>

      <div className="card">
        <table className="events-table">
          <thead>
            <tr><th>Payment ID</th><th>Event</th><th>Amount</th><th>Date</th><th>Status</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>#2025-001</td>
              <td>Wedding Reception</td>
              <td>₱5,000</td>
              <td>2025-09-20</td>
              <td><span className="tag confirmed">Verified</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
