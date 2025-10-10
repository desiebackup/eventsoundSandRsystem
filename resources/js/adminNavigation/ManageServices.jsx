import React from "react";
import "../../css/adminnav/ManageServices.css";

export default function ManageServices() {
  return (
    <div className="admin-page">
      <h2>Manage Service Packages</h2>

      <button className="btn-add">+ Add Service</button>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Service Name</th>
            <th>Price</th>
            <th>Inclusions</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Basic Sound Package</td>
            <td>₱5,000</td>
            <td>Speakers, Mixer, Mic</td>
            <td>
              <button className="btn-edit">Edit</button>
              <button className="btn-delete">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
