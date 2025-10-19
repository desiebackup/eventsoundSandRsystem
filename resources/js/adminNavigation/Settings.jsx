import React, { useState } from "react";
import "../../css/adminnav/Settings.css";

export default function Settings() {
  const [form, setForm] = useState({
    siteName: "Event Reservation System",
    adminEmail: "admin@example.com",
    theme: "light",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Settings saved successfully!");
    // In production, send axios.post('/api/settings', form)
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>

      <div className="bg-white rounded-2xl shadow-md p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700">System Name</label>
            <input
              type="text"
              name="siteName"
              value={form.siteName}
              onChange={handleChange}
              className="mt-1 w-full border rounded-lg px-4 py-2 focus:ring focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Admin Email</label>
            <input
              type="email"
              name="adminEmail"
              value={form.adminEmail}
              onChange={handleChange}
              className="mt-1 w-full border rounded-lg px-4 py-2 focus:ring focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Theme</label>
            <select
              name="theme"
              value={form.theme}
              onChange={handleChange}
              className="mt-1 w-full border rounded-lg px-4 py-2 focus:ring focus:ring-blue-300"
            >
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
