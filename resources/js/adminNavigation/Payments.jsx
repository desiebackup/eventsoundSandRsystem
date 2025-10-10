import React from "react";
import "../../css/adminnav/Payment.css";

export default function Payments() {
  return (
    <div className="admin-page">
      <h2>Manage Payments</h2>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Client</th>
            <th>Event</th>
            <th>Amount</th>
            <th>Date Paid</th>
            <th>Reference</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>10</td>
            <td>Mark Reyes</td>
            <td>Birthday Party</td>
            <td>₱7,000</td>
            <td>2025-10-05</td>
            <td>#123ABC</td>
            <td><span className="status paid">Paid</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
