import React from "react";
import "../../css/adminnav/ManageUsers.css";

export default function ManageUsers() {
  return (
    <div className="admin-page">
      <h2>Manage Users</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Alex Cruz</td>
            <td>alex@example.com</td>
            <td>User</td>
            <td>
              <button className="btn-edit">Edit</button>
              <button className="btn-delete">Delete</button>
            </td>
          </tr>
          <tr>
            <td>2</td>
            <td>Mary Santos</td>
            <td>mary@example.com</td>
            <td>Admin</td>
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
