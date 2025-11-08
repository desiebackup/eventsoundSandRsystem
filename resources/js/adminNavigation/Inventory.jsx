import React, { useState, useEffect } from "react";
import "../../css/adminnav/Inventory.css";

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    name: "",
    quantity: "",
    condition: "Good",
  });
  const [editingItem, setEditingItem] = useState(null);

  // === Load saved inventory from localStorage ===
  useEffect(() => {
    const savedItems = JSON.parse(localStorage.getItem("inventoryData")) || [];
    setItems(savedItems);
  }, []);

  // === Save inventory to localStorage ===
  const saveToLocalStorage = (data) => {
    localStorage.setItem("inventoryData", JSON.stringify(data));
  };

  // === Handle input change ===
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // === Add or Update item ===
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.quantity) {
      alert("Please fill in all fields.");
      return;
    }

    let updatedItems;
    if (editingItem) {
      updatedItems = items.map((item) =>
        item.id === editingItem.id ? { ...form, id: editingItem.id } : item
      );
      alert("Item updated successfully!");
    } else {
      const newItem = {
        id: Date.now(),
        name: form.name,
        quantity: parseInt(form.quantity),
        condition: form.condition,
      };
      updatedItems = [...items, newItem];
      alert("Item added successfully!");
    }

    setItems(updatedItems);
    saveToLocalStorage(updatedItems);
    setForm({ name: "", quantity: "", condition: "Good" });
    setEditingItem(null);
  };

  // === Edit item ===
  const handleEdit = (item) => {
    setForm({ name: item.name, quantity: item.quantity, condition: item.condition });
    setEditingItem(item);
  };

  // === Delete item ===
  const handleDelete = (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    const updatedItems = items.filter((item) => item.id !== id);
    setItems(updatedItems);
    saveToLocalStorage(updatedItems);
  };

  // === Clear all inventory ===
  const handleClearAll = () => {
    if (!confirm("Clear all inventory items?")) return;
    setItems([]);
    localStorage.removeItem("inventoryData");
  };

  return (
    <div className="inventory-page">
      <h2>Inventory Management</h2>

      {/* === FORM === */}
      <form className="inventory-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Item name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={form.quantity}
          onChange={handleChange}
          required
        />
        <select name="condition" value={form.condition} onChange={handleChange}>
          <option value="Good">Good</option>
          <option value="Needs Repair">Needs Repair</option>
          <option value="Out of Order">Out of Order</option>
        </select>

        <div className="form-actions">
          <button type="submit">
            {editingItem ? "Update Item" : "Add Item"}
          </button>
          {editingItem && (
            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                setForm({ name: "", quantity: "", condition: "Good" });
                setEditingItem(null);
              }}
            >
              Cancel
            </button>
          )}
          {items.length > 0 && (
            <button type="button" className="clear-btn" onClick={handleClearAll}>
              Clear All
            </button>
          )}
        </div>
      </form>

      {/* === TABLE === */}
      <table className="inventory-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Item Name</th>
            <th>Quantity</th>
            <th>Condition</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
            items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>
                  <span
                    className={`status ${item.condition
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {item.condition}
                  </span>
                </td>
                <td className="action-buttons">
                  <button className="edit-btn" onClick={() => handleEdit(item)}>
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="no-data">
                No inventory items yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
