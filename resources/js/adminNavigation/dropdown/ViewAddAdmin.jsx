import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../../css/adminnav/dropdown/ViewAddAdmin.css";
import defaultAvatar from "../../../img/avatar.png";

export default function ViewAddAdmin() {
  const base = "http://127.0.0.1:8000";
  const token = localStorage.getItem("token");

  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [newAdmin, setNewAdmin] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch admin list
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${base}/api/admins`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load admin list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Add new admin
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newAdmin.password !== newAdmin.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await axios.post(`${base}/api/admin/create`, newAdmin, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("New admin added successfully!");
      setNewAdmin({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      fetchAdmins();
    } catch (err) {
      console.error(err);
      setError("Failed to add new admin.");
    }
  };

  // Delete admin
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    try {
      await axios.delete(`${base}/api/admin/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Admin deleted successfully.");
      fetchAdmins();
    } catch (err) {
      console.error(err);
      setError("Failed to delete admin.");
    }
  };

  // View admin details
  const handleView = (admin) => {
    setSelectedAdmin(admin);
  };

  // Back to list
  const handleBack = () => {
    setSelectedAdmin(null);
  };

  return (
    <div className="admin-manage-wrapper">
      {!selectedAdmin ? (
        <>
          <div className="admin-manage-header">
            <h2>View / Add Admin</h2>
            <p>Manage administrator accounts. Add new admins or view existing ones.</p>
          </div>

          {/* Add Admin Form */}
          <div className="admin-manage-card">
            <h3>Add New Admin</h3>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="input-grid">
                <div className="input-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={newAdmin.firstname}
                    onChange={(e) =>
                      setNewAdmin({ ...newAdmin, firstname: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={newAdmin.lastname}
                    onChange={(e) =>
                      setNewAdmin({ ...newAdmin, lastname: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="input-group full">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={newAdmin.email}
                    onChange={(e) =>
                      setNewAdmin({ ...newAdmin, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={newAdmin.password}
                    onChange={(e) =>
                      setNewAdmin({ ...newAdmin, password: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    value={newAdmin.confirmPassword}
                    onChange={(e) =>
                      setNewAdmin({
                        ...newAdmin,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="button-row">
                <button type="submit" className="btn btn-primary">
                  Add Admin
                </button>
              </div>

              {message && <div className="msg success">{message}</div>}
              {error && <div className="msg error">{error}</div>}
            </form>
          </div>

          {/* Admin Cards */}
          <div className="admin-list-card">
            <h3>Existing Admins</h3>
            {loading ? (
              <p>Loading...</p>
            ) : admins.length === 0 ? (
              <p className="no-admins">No admins found.</p>
            ) : (
              <div className="admin-grid">
                {admins.map((admin) => (
                  <div key={admin.id} className="admin-card">
                    <img
                      src={admin.profile_picture || defaultAvatar}
                      alt="Admin"
                      className="admin-avatar"
                    />
                    <h4>
                      {admin.firstname} {admin.lastname}
                    </h4>
                    <div className="admin-card-buttons">
                      <button
                        className="btn btn-view"
                        onClick={() => handleView(admin)}
                      >
                        View
                      </button>
                      <button
                        className="btn btn-delete"
                        onClick={() => handleDelete(admin.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="admin-view-container">
          <button className="back-button" onClick={handleBack}>
            ← Back
          </button>
          <div className="admin-view-card">
            <img
              src={selectedAdmin.profile_picture || defaultAvatar}
              alt="Profile"
              className="admin-view-avatar"
            />
            <h2>
              {selectedAdmin.firstname} {selectedAdmin.lastname}
            </h2>
            <p>
              <strong>Email:</strong> {selectedAdmin.email}
            </p>
            <p>
              <strong>Password:</strong> ********
            </p>
          </div>
        </div>
      )}
    </div>
  );
}