import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../../css/adminnav/ManageServices.css";

export default function ManageServices() {
  const fileInputRef = useRef(null);
  const [services, setServices] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [form, setForm] = useState({
    image: null,
    name: "",
    price: "",
    downPayment: "",
    inclusions: "",
    description: "",
    note: "",
    balance: "",
    type: "package", // default
  });

  // === FETCH SERVICES ===
  useEffect(() => {
    axios
      .get("/api/admin/services")
      .then((res) => {
        const normalized = (res.data || []).map((s) => ({
          ...s,
          downPayment: s.down_payment ?? s.downPayment ?? 0,
          balance: s.balance ?? 0,
        }));
        setServices(normalized);
      })
      .catch(() => setServices([]));
  }, []);

  // === HANDLE IMAGE UPLOAD ===
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, image: file });
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  // === HANDLE SAVE (CREATE OR UPDATE) ===
  const handleSave = async () => {
    if (!form.name.trim()) return alert("Name is required");
    if (!form.price || isNaN(Number(form.price))) return alert("Price must be a number");

    const fd = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
      fd.append(key, val);
  }
    });

    try {
      let res;
      if (editingId) {
        res = await axios.post(`/api/admin/services/${editingId}?_method=PUT`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const normalized = {
          ...res.data,
          downPayment: res.data.down_payment ?? res.data.downPayment ?? 0,
        };
        setServices((prev) => prev.map((x) => (x.id === editingId ? normalized : x)));
      } else {
        res = await axios.post("/api/admin/services", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const normalized = {
          ...res.data,
          downPayment: res.data.down_payment ?? res.data.downPayment ?? 0,
        };
        setServices((prev) => [...prev, normalized]);
      }

      alert("Service saved successfully!");
      resetForm();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || e.message || "Failed to save service");
    }
  };

  // === HANDLE DELETE ===
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

  // === HANDLE EDIT ===
  const handleEdit = (pkg) => {
    setEditingId(pkg.id);
    setForm({
      image: null,
      name: pkg.name || "",
      price: pkg.price || "",
      downPayment: pkg.downPayment ?? pkg.down_payment ?? "",
      inclusions: pkg.inclusions || "",
      description: pkg.description || "",
      note: pkg.note || "",
      balance: pkg.balance ?? "",
      type: pkg.type || "package",
    });
    setImagePreview(pkg.image_url || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      image: null,
      name: "",
      price: "",
      downPayment: "",
      inclusions: "",
      description: "",
      note: "",
      balance: "",
      type: "package",
    });
    setImagePreview(null);
  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }
  };
  

  return (
    <div className="admin-page">
      <div className="add-service">
        <h2>{editingId ? "Edit Service" : "Add New Service"}</h2>

        {/* === IMAGE UPLOAD === */}
        <div className="image-upload">
          <label>Service Image:</label>
          <input type="file" accept="image/*" onChange={handleImageChange} ref={fileInputRef}/>

          {imagePreview && (
            <img
              src={imagePreview}
              alt="preview"
              className="preview-img"
            />
          )}
        </div>

        {/* === TYPE SELECTION === */}
        <label className="service-type">Service Type:</label>
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="package">Package</option>
          <option value="custom">Custom</option>
        </select>

        {/* === COMMON FIELDS === */}
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

        {/* === CONDITIONAL FIELDS === */}
        {form.type === "package" ? (
          <textarea
            placeholder="Inclusions"
            value={form.inclusions}
            onChange={(e) => setForm({ ...form, inclusions: e.target.value })}
          />
        ) : (
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        )}

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

        {/* === BUTTONS === */}
        {editingId ? (
          <div className="btn-group">
            <button className="btn-cancel" onClick={resetForm}>
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

      {/* === SERVICE TABLE === */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Image</th>
            <th>Type</th>
            <th>Name</th>
            <th>Price</th>
            <th>Down Payment</th>
            <th>Inclusions / Description</th>
            <th>Note</th>
            <th>Balance</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map((pkg) => (
            <tr key={pkg.id}>
            <td >{pkg.id}</td>
              <td>
                {pkg.image_url ? (
                  <img
                    src={pkg.image_url}
                    alt="service"
                    className="service-img"
                  />
                ) : (
                  <em className="muted">No image</em>
                )}
              </td>
              <td>{pkg.type || "package"}</td>
              <td>{pkg.name}</td>
              <td>₱ {pkg.price?.toLocaleString()}</td>
              <td>
                {pkg.downPayment ? (
                  `₱ ${pkg.downPayment.toLocaleString()}`
                ) : (
                  <em className="muted">No down payment</em>
                )}
              </td>
              <td>
                {pkg.type === "package"
                  ? pkg.inclusions || <em className="muted">No inclusions</em>
                  : pkg.description || <em className="muted">No description</em>}
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