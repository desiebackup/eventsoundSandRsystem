import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/adminnav/Inventory.css";

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all"); // "all", "available", "in_use", "maintenance"

  useEffect(() => {
    fetchInventory();
  }, []);

  // Listen for updated services broadcast (after approving a reservation)
  useEffect(() => {
    const handler = (e) => {
      const updated = e?.detail ?? [];
      if (!Array.isArray(updated) || updated.length === 0) return;
      setItems((prev) => {
        const map = new Map(prev.map((it) => [it.id, it]));
        updated.forEach((u) => {
          // ensure id exists and merge/replace
          if (!u?.id) return;
          const existing = map.get(u.id) || {};
          map.set(u.id, { ...existing, ...u });
        });
        return Array.from(map.values());
      });
    };

    window.addEventListener('servicesUpdated', handler);
    return () => window.removeEventListener('servicesUpdated', handler);
  }, []);

  // ✅ Safe fetch with fallback handling
  const fetchInventory = async () => {
    try {
      const res = await axios.get("/api/admin/services");
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];
      setItems(data);
    } catch (err) {
      console.error("Failed to load services for inventory:", err);
      setItems([]);
    }
  };

  // ✅ Status update function
  const updateStatus = async (id, newStatus, extra = {}) => {
    try {
      await axios.put(`/api/admin/services/${id}`, { status: newStatus, ...extra });
      await fetchInventory(); // ensure refresh after update
    } catch (err) {
      console.error("Failed to update service status:", err);
      alert("Unable to update status. Check console for details.");
    }
  };

  // ✅ Safe class handling for statuses
  const getStatusClass = (status) => {
    const s = (status || "").toString().toLowerCase();
    switch (s) {
      case "available":
      case "avail":
        return "status-available";
      case "in_use":
      case "in use":
      case "inuse":
        return "status-inuse";
      case "maintenance":
      case "maint":
        return "status-maintenance";
      default:
        return "status-unknown";
    }
  };

  // ✅ Normalize status for filtering
  const normalizeStatus = (status) => {
    const s = (status || "").toString().toLowerCase();
    if (["available", "avail"].includes(s)) return "available";
    if (["in_use", "in use", "inuse"].includes(s)) return "in_use";
    if (["maintenance", "maint"].includes(s)) return "maintenance";
    return "unknown";
  };

  // ✅ Filter logic (use normalized statuses)
  const filteredItems =
    filter === "all" ? items : items.filter((item) => normalizeStatus(item.status) === filter);

  // ✅ Click handler for cards
  const handleFilterChange = (type) => {
    setFilter(type);
  };

  return (
    <div className="inventory-container">
      <h2 className="inventory-title">Service Inventory Overview</h2>

      {/* ===== Summary Cards ===== */}
      <div className="summary-cards">
        <div
          className={`card ${filter === "all" ? "active" : ""}`}
          onClick={() => handleFilterChange("all")}
        >
          <h4>Total Services</h4>
          <p>{items.length}</p>
        </div>

        <div
          className={`card ${filter === "in_use" ? "active" : ""}`}
          onClick={() => handleFilterChange("in_use")}
        >
          <h4>In Use</h4>
          <p>{items.filter((i) => normalizeStatus(i.status) === "in_use").length}</p>
        </div>

        <div
          className={`card ${filter === "available" ? "active" : ""}`}
          onClick={() => handleFilterChange("available")}
        >
          <h4>Available</h4>
          <p>{items.filter((i) => normalizeStatus(i.status) === "available").length}</p>
        </div>

        <div
          className={`card ${filter === "maintenance" ? "active" : ""}`}
          onClick={() => handleFilterChange("maintenance")}
        >
          <h4>Maintenance</h4>
          <p>{items.filter((i) => normalizeStatus(i.status) === "maintenance").length}</p>
        </div>
      </div>

      {/* ===== Inventory Table ===== */}
      <div className="inventory-table-container">
        <h3 className="table-header">
          {filter === "all"
            ? "All Services"
            : filter === "available"
            ? "Available Services"
            : filter === "in_use"
            ? "In Use Services"
            : "Under Maintenance"}
        </h3>

        <table className="inventory-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Next Use</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  No records found for this category.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const name = item.name || item.service_type || "Unnamed";
                const type =
                  item.type && item.type.length
                    ? item.type.charAt(0).toUpperCase() + item.type.slice(1)
                    : "N/A";
                const statusRaw = item.status ?? "";
                const statusLabel =
                  (statusRaw || "").toString().replace(/_/g, " ").toUpperCase() || "UNKNOWN";

                return (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{name}</td>
                    <td>{type}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(statusRaw)}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td>
                      {item.next_use_start && item.next_use_end ? (
                        <span>
                          {new Date(item.next_use_start).toLocaleString()} →{" "}
                          {new Date(item.next_use_end).toLocaleString()}
                        </span>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td>
                      {normalizeStatus(item.status) === "maintenance" ? (
                        <button
                          className="btn btn-available"
                          onClick={() => updateStatus(item.id, "available")}
                        >
                          Mark as Repaired
                        </button>
                      ) : (
                        <button
                          className={`btn btn-maintenance ${normalizeStatus(item.status) === 'in_use' ? 'disabled' : ''}`}
                          onClick={() => normalizeStatus(item.status) !== 'in_use' && updateStatus(item.id, "maintenance")}
                          disabled={normalizeStatus(item.status) === 'in_use'}
                          title={normalizeStatus(item.status) === 'in_use' ? 'Cannot set to maintenance while in use' : 'Set to maintenance'}
                        >
                          Set to Maintenance
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}