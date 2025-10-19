import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/adminnav/ManageServices.css";

export default function ManageServices() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", inclusions: "", note: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    axios
      .get("/api/admin/services")
      .then((res) => setServices(res.data))
      .catch(() => setServices([]));
  }, []);

  const handleSave = async () => {
    // client-side validation
    if (!form.name || form.name.trim() === "") {
      alert('Name is required');
      return;
    }
    if (!form.price || isNaN(Number(form.price))) {
      alert('Price is required and must be a number');
      return;
    }

    if (editingId) {
      // update
    try {
  const res = await axios.put(`/api/admin/services/${editingId}`, { ...form, price: Number(form.price) });
        setServices((s) => s.map((x) => (x.id === editingId ? res.data : x)));
        setEditingId(null);
  setForm({ name: "", price: "", inclusions: "", note: "" });
      } catch (e) {
        console.error(e);
        const msg = e?.response?.data?.message || e.message || "Failed to update service";
        alert(msg);
      }
    } else {
      // create
      try {
  const res = await axios.post("/api/admin/services", { ...form, price: Number(form.price) });
        setServices((s) => [...s, res.data]);
  setForm({ name: "", price: "", inclusions: "", note: "" });
      } catch (e) {
        console.error(e);
        const msg = e?.response?.data?.message || e.message || "Failed to add service";
        alert(msg);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this service?")) return;
    try {
      await axios.delete(`/api/admin/services/${id}`);
      setServices((s) => s.filter((sv) => sv.id !== id));
    } catch (e) {
      console.error(e);
      alert("Failed to delete service");
    }
  };

  const handleEdit = (pkg) => {
    setEditingId(pkg.id);
    setForm({ name: pkg.name || "", price: pkg.price || "", inclusions: pkg.inclusions || "", note: pkg.note || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ name: "", price: "", inclusions: "", note: "" });
  };

  return (
    <div className="admin-page">

      <div className="add-service">
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
  <textarea placeholder="Inclusions" value={form.inclusions} onChange={(e) => setForm({ ...form, inclusions: e.target.value })} />
  <textarea placeholder="Note" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />

  {editingId ? (
          <>
            <button className="btn-add" onClick={handleSave}>
              Save Changes
            </button>
            <button className="btn-cancel" onClick={handleCancel}>
              Cancel
            </button>
          </>
        ) : (
          <button className="btn-add" onClick={handleSave}>
            + Add Service
          </button>
        )}
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Service Name</th>
            <th>Price</th>
            <th>Inclusions</th>
            <th>Note</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map((pkg) => (
            <tr key={pkg.id}>
              <td>{pkg.id}</td>
              <td>{pkg.name}</td>
              <td>{pkg.price}</td>
              <td>
                {pkg.inclusions ? (
                  pkg.inclusions.split("\n").map((inc, i) => <div key={i}>{inc}</div>)
                ) : (
                  <em className="muted">No inclusions</em>
                )}
              </td>
              <td>
                {pkg.note ? <div className="service-note">{pkg.note}</div> : <em className="muted">-</em>}
              </td>
              <td>
                <button className="btn-edit" onClick={() => handleEdit(pkg)}>
                  Edit
                </button>
                <button className="btn-delete" onClick={() => handleDelete(pkg.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
