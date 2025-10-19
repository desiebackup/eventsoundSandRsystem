import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../css/usernav/Reservation.css";

const Reservation = () => {
  const [reservations, setReservations] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedDownPayment, setSelectedDownPayment] = useState(null);
  const navigate = useNavigate();
  const [form, setForm] = useState({ event_name: "", service_package: "", venue: "", address: "", call_time: "", down_payment: null });

  useEffect(() => {
    axios.get('/api/reservations').then(r => setReservations(r.data)).catch(() => setReservations([]));
    axios.get('/api/services').then(r => setServices(r.data)).catch(() => setServices([]));
  }, []);

  const handleCancel = async (id) => {
    if (!confirm('Cancel reservation?')) return;
    try {
      await axios.delete(`/api/reservations/${id}`);
      setReservations((s) => s.filter(r => r.id !== id));
    } catch (e) {
      console.error(e);
      alert('Failed to cancel');
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) setForm({ ...form, [name]: files[0] });
    else setForm({ ...form, [name]: value });
  };

  const handleReserve = async () => {
    try {
      const fd = new FormData();
      fd.append('event_name', form.event_name);
      fd.append('service_package', form.service_package);
      fd.append('venue', form.venue);
      fd.append('address', form.address);
      fd.append('call_time', form.call_time);
      if (form.down_payment) fd.append('down_payment', form.down_payment);

  const res = await axios.post('/api/reservations', fd);
      setReservations((r) => [res.data, ...r]);
      alert('Reservation created');
    } catch (e) {
      console.error(e);
      alert('Failed to create reservation');
    }
  };

  return (
    <div className="reservation-container">
      <div className="reservation-form">
        <button onClick={() => navigate('/userdashboard/makereservation')}>Make a Reservation</button>
      </div>

      <div className="reservation-list">
        {reservations.length === 0 && <p>No reservations yet.</p>}
        {reservations.map((res) => (
          <div key={res.id} className="reservation-card">
            <h3>{res.event_name}</h3>
            <p>Package: {res.service_package}</p>
            <p>Date: {new Date(res.call_time).toLocaleString()}</p>
            <p>Venue: {res.venue}</p>
            {res.down_payment && (
              <p>
                Down payment: <a href="#" onClick={(e) => { e.preventDefault(); setSelectedDownPayment(res.down_payment); }}>View</a>
              </p>
            )}
            <p>Status: <strong>{res.status}</strong></p>
            <button className="cancel-btn" onClick={() => handleCancel(res.id)}>Cancel Reservation</button>
          </div>
        ))}
      </div>
      {/* modal for down payment preview */}
      {selectedDownPayment && (
        <div className="dp-modal-overlay">
          <div className="dp-modal">
            <div className="dp-modal-header">
              <h4>Down Payment</h4>
              <button className="dp-close-btn" onClick={() => setSelectedDownPayment(null)}>Close</button>
            </div>
            <div className="dp-modal-body">
              <img src={`/storage/${selectedDownPayment}`} alt="Down Payment" className="dp-modal-img" />
              <p className="dp-filename">{selectedDownPayment}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservation;
