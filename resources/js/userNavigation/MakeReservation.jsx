import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "../../css/usernav/MakeReservation.css";

const MakeReservation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const packageName = params.get("package") || "";

  const [form, setForm] = useState({
    event_name: "",
    service_package: "",
    service_id: '',
    venue: "",
    address: "",
    call_date: "",
    call_time: "",
    down_payment: null,
  });
  const [services, setServices] = useState([]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm({ ...form, [name]: files[0] });
    } else {
      if (name === 'service_id') {
        const svc = services.find(s => String(s.id) === String(value));
        setForm({ ...form, service_id: value, service_package: svc ? svc.name : '' });
      } else {
        setForm({ ...form, [name]: value });
      }
    }
  };

  // fetch available services for dropdown
  React.useEffect(() => {
    axios.get('/api/services')
      .then(r => {
        const svcList = r.data || [];
        setServices(svcList);
        // if a packageName was passed via query param, try to preselect its service_id
        if (packageName) {
          const matched = svcList.find(s => String(s.name) === String(packageName) || (s.name || '').toLowerCase().trim() === (packageName || '').toLowerCase().trim());
          if (matched) {
            setForm(f => ({ ...f, service_id: String(matched.id), service_package: matched.name }));
          } else {
            // if no exact match, still set service_package as provided
            setForm(f => ({ ...f, service_package: packageName }));
          }
        }
      })
      .catch(() => setServices([]));
  }, []);

  const handleSubmit = async () => {
    try {
    const fd = new FormData();
  fd.append("event_name", form.event_name);
  if (form.service_id) fd.append("service_id", form.service_id);
  fd.append("service_package", form.service_package);
    fd.append("venue", form.venue || "TBD");
    fd.append("address", form.address || "TBD");
    // combine date + time into an ISO datetime if both provided
    let combinedCall = form.call_time && form.call_date ? `${form.call_date}T${form.call_time}` : (form.call_time || form.call_date || 'TBD');
    fd.append("call_time", combinedCall);
      if (form.down_payment) fd.append("down_payment", form.down_payment);

      const res = await axios.post("/api/reservations", fd);

      alert("Reservation created: " + res.data.id);
      navigate('/userdashboard/reservations', { replace: true });
    } catch (err) {
      console.error(err);
      const serverMsg = err?.response?.data?.message || err?.response?.data?.error || (err?.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(' ') : null);
      alert("Failed to create reservation: " + (serverMsg || 'Please try again.'));
    }
  };

  return (
    <div className="make-reservation">
      <h2>Make a Reservation</h2>

      <div className="reservation-form">
        <label>Event name</label>
        <input type="text" name="event_name" value={form.event_name} onChange={handleChange} />

        <label>Package</label>
        <select name="service_id" value={form.service_id} onChange={handleChange}>
          <option value="">Select a package</option>
          {services.map(s => (
            <option key={s.id} value={s.id}>{s.name} - ₱{s.price}</option>
          ))}
        </select>

        <label>Venue</label>
        <input type="text" name="venue" value={form.venue} onChange={handleChange} />

        <label>Address</label>
        <input type="text" name="address" value={form.address} onChange={handleChange} />

  <label>Date</label>
  <input type="date" name="call_date" value={form.call_date} onChange={handleChange} />

  <label>Time</label>
  <input type="time" name="call_time" value={form.call_time} onChange={handleChange} />

        <label>Down payment (image)</label>
        <input type="file" name="down_payment" accept="image/*" onChange={handleChange} />

        <div style={{ marginTop: 12 }}>
          <button className="book-btn" onClick={handleSubmit}>Confirm Reservation</button>
          <button className="book-cancel" onClick={() => navigate(-1)} style={{ marginLeft: 8 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default MakeReservation;
