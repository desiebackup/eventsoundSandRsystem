import React, { useState } from 'react';
import axios from 'axios';
import avatarDefault from '../../img/avatar.png';

export default function AdminDropdown({ user, onLogout, onProfileUpdate }) {
  const [open, setOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ firstname: '', lastname: '', email: '', password: '' });

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await axios.post(
          '/api/logout',
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (e) {
        console.error('Logout error', e);
      }
    }

    // Always remove token locally
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    onLogout?.();
  };

  const handleAddAdmin = async () => {
    try {
      const res = await axios.post('/api/users', { ...newAdmin, role: 'admin' });
      alert('Admin added: ' + res.data.user.email);
      setShowAdd(false);
    } catch (e) {
      console.error(e);
      alert('Failed to add admin');
    }
  };

  return (
    <div className="admin-dropdown">
      <div className="user-chip" onClick={() => setOpen(!open)}>
        <img src={user?.avatar ? `/storage/${user.avatar}` : avatarDefault} alt="admin" className="logo" />
        <span className="user-name">{user?.firstname || 'Admin'}</span>
      </div>

      {open && (
        <div className="dropdown-menu">
          <button onClick={() => { setOpen(false); onProfileUpdate?.(); }}>View Profile</button>
          <button onClick={() => setShowAdd(true)}>Add Admin</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}

      {showAdd && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add Admin</h3>
            <input placeholder="First name" value={newAdmin.firstname} onChange={(e) => setNewAdmin({ ...newAdmin, firstname: e.target.value })} />
            <input placeholder="Last name" value={newAdmin.lastname} onChange={(e) => setNewAdmin({ ...newAdmin, lastname: e.target.value })} />
            <input placeholder="Email" value={newAdmin.email} onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} />
            <input placeholder="Password" type="password" value={newAdmin.password} onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })} />
            <div className="modal-actions">
              <button onClick={handleAddAdmin}>Create</button>
              <button onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
