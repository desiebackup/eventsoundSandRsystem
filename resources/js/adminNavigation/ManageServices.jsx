import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/adminnav/ManageServices.css";

export default function ManageServices() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    downPayment: "",
    inclusions: "",
    note: "",
    balance: ""
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    axios
      .get("/api/admin/services")
      .then((res) => {
        const normalized = (res.data || []).map((s) => ({
          ...s,
          // ensure frontend-friendly camelCase alias exists for down payment
          downPayment: s.down_payment ?? s.downPayment ?? 0,
          // balance kept as-is (server returns balance)
          balance: s.balance ?? s.balance ?? 0,
        }));
        setServices(normalized);
      })
      .catch(() => setServices([]));
  }, []);

  const handleSave = async () => {
    if (!form.name.trim()) return alert("Name is required");
    if (!form.price || isNaN(Number(form.price))) return alert("Price must be a number");

    const payload = {
      ...form,
      price: Number(form.price),
      downPayment: Number(form.downPayment || 0),
      balance: Number(form.balance || 0),
    };

    try {
      let res;
      if (editingId) {
        res = await axios.put(`/api/admin/services/${editingId}`, payload);
        const normalized = { ...res.data, downPayment: res.data.down_payment ?? res.data.downPayment ?? 0 };
        setServices((s) => s.map((x) => (x.id === editingId ? normalized : x)));
      } else {
        res = await axios.post("/api/admin/services", payload);
        const normalized = { ...res.data, downPayment: res.data.down_payment ?? res.data.downPayment ?? 0 };
        setServices((s) => [...s, normalized]);
      }

      setEditingId(null);
      setForm({
        name: "",
        price: "",
        downPayment: "",
        inclusions: "",
        note: "",
        balance: ""
      });
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || e.message || "Failed to save service");
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
    setForm({
      name: pkg.name || "",
      price: pkg.price || "",
      downPayment: pkg.downPayment ?? pkg.down_payment ?? "",
      inclusions: pkg.inclusions || "",
      note: pkg.note || "",
      balance: pkg.balance ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({
      name: "",
      price: "",
      downPayment: "",
      inclusions: "",
      note: "",
      balance: ""
    });
  };

  return (
    <div className="admin-page">
      <div className="add-service">
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
        <input
          placeholder="Down Payment"
          value={form.downPayment}
          onChange={(e) => setForm({ ...form, downPayment: e.target.value })}
        />
        <textarea
          placeholder="Inclusions"
          value={form.inclusions}
          onChange={(e) => setForm({ ...form, inclusions: e.target.value })}
        />
        <textarea
          placeholder="Note"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
        />
        <input
          placeholder="Balance"
          value={form.balance}
          onChange={(e) => setForm({ ...form, balance: e.target.value })}
        />

        {editingId ? (
          <div className="btn-group">
            <button className="btn-cancel" onClick={handleCancel}>
              Cancel
            </button>
            <button className="btn-save" onClick={handleSave}>
              Save Changes
            </button>
            
          </div>
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
            <th>Down Payment</th>
            <th>Inclusions</th>
            <th>Note</th>
            <th>Balance</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map((pkg) => (
            <tr key={pkg.id}>
              <td>{pkg.id}</td>
              <td>
                <a href={`/userdashboard/servicepackage?package=${encodeURIComponent(pkg.name)}`} className="service-link">
                  {pkg.name}
                </a>
              </td>
              <td>₱ {pkg.price?.toLocaleString()}</td>
              <td>
                {pkg.downPayment
                  ? `₱ ${pkg.downPayment.toLocaleString()}`
                  : <em className="muted">No down payment</em>}
              </td>
              <td>
                {pkg.inclusions
                  ? pkg.inclusions.split("\n").map((inc, i) => <div key={i}>{inc}</div>)
                  : <em className="muted">No inclusions</em>}
              </td>
              <td>{pkg.note || <em className="muted">-</em>}</td>
              <td>
                {pkg.balance
                  ? `₱ ${pkg.balance.toLocaleString()}`
                  : <em className="muted">No balance</em>}
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
