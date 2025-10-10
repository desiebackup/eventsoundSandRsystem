import React from "react";
import "../../css/adminnav/ManageReservations.css";

export default function ManageReservations() {
  return (
    <div className="admin-page">
      <h2>Manage Reservations</h2>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Event Name</th>
            <th>Client</th>
            <th>Date</th>
            <th>Venue</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>23</td>
            <td>Wedding Ceremony</td>
            <td>Jane Doe</td>
            <td>2025-11-10</td>
            <td>Manila Hotel</td>
            <td><span className="status pending">Pending</span></td>
            <td>
              <button className="btn-approve">Approve</button>
              <button className="btn-delete">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
