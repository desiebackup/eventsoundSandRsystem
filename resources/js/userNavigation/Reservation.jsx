import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaArrowLeft, FaPaperPlane } from "react-icons/fa";
import "../../css/usernav/Reservation.css";

const Reservation = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  const [form, setForm] = useState({
    event_name: "",
    event_type: "",
    venue_type: "",
    call_date: "",
    call_time: "",
    start_time: "",
    end_time: "",
    phone: "",
    purok: "",
    barangay: "",
    city: "",
    province: "",
    down_payment: null,
  });

  useEffect(() => {
    axios
      .get("/api/services")
      .then((res) => setServices(res.data))
      .catch(() => setServices([]));
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) setForm({ ...form, [name]: files[0] });
    else setForm({ ...form, [name]: value });
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
  };

  const handleSubmit = async () => {
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      if (selectedService) {
        fd.append("service_id", selectedService.id);
      }

      const res = await axios.post("/api/reservations", fd);
      alert(`Reservation created: ${res.data.id}`);
      navigate("/userdashboard/reservations");
    } catch (err) {
      console.error(err);
      alert("Failed to create reservation. Please try again.");
    }
  };

  return (
    <div className="reservation-wrapper">
      <h2 className="page-title">New Event Reservation</h2>

      {/* Step Progress Indicator */}
      <div className="steps-header">
        {[
          { num: 1, title: "Details" },
          { num: 2, title: "Services" },
          { num: 3, title: "Review & Book" },
        ].map((s, i) => (
          <div key={i} className="step-item">
            <div
              className={`step-circle ${
                step === s.num ? "active" : step > s.num ? "completed" : ""
              }`}
            >
              {step > s.num ? "✓" : s.num}
            </div>
            <span className="step-title">{s.title}</span>
            {i < 2 && <div className={`step-line ${step > s.num ? "filled" : ""}`}></div>}
          </div>
        ))}
      </div>
      <hr/>

      {/* Step 1 */}
      {step === 1 && (
        <div className="step-content">
          <div className="form-card">
          <h3>1. Tell Us About Your Event</h3>
            <label>Event Name </label>
            <input
              type="text"
              name="event_name"
              value={form.event_name}
              onChange={handleChange}
              placeholder="e.g., Shane’s Birthday"
              required
            />

            <label>Event Type </label>
            <select
              name="event_type"
              value={form.event_type}
              onChange={handleChange}
              required
            >
              <option value="">Select event type</option>
              <option value="Birthday">Birthday</option>
              <option value="Wedding">Wedding</option>
              <option value="Concert">Concert</option>
              <option value="Corporate">Corporate</option>
              <option value="Other">Other</option>
            </select>

            <label>Venue Type </label>
            <select
              name="venue_type"
              value={form.venue_type}
              onChange={handleChange}
              required
            >
              <option value="">Select venue type</option>
              <option value="Gym">Gym</option>
              <option value="House">House</option>
              <option value="Hall">Hall</option>
              <option value="Outdoor">Outdoor</option>
            </select>

            <div className="date-time-grid">
              <div>
                <label>Date *</label>
                <input
                  type="date"
                  name="call_date"
                  value={form.call_date}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Call Time </label>
                <input
                  type="time"
                  name="call_time"
                  value={form.call_time}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="time-grid">
              <div>
                <label>Start Time </label>
                <input
                  type="time"
                  name="start_time"
                  value={form.start_time}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>End Time </label>
                <input
                  type="time"
                  name="end_time"
                  value={form.end_time}
                  onChange={handleChange}
                />
              </div>
            </div>

            <label>Phone Number</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="09000000000"
              required
            />

            <label>Location</label>
            <div className="location-grid">
            <input
             type="text"
             name="purok"
             value={form.purok}
             onChange={handleChange}
             placeholder="Purok"
             required
            />
            <input
            type="text"
            name="barangay"
            value={form.barangay}
            onChange={handleChange}
            placeholder="Barangay"
            required
           />
           <input
            type="text"
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder="Municipal/City"
            required
           />
           <input
            type="text"
            name="province"
            value={form.province}
            onChange={handleChange}
            placeholder="Province"
            required
           />
           </div>

          </div>

          <div className="step-buttons">
            <button className="next-btn" onClick={() => setStep(2)}>
              Next <FaArrowRight />
            </button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="step-content">
          <h3>2. Choose a Service Package</h3>
          <div className="package-grid">
            {services.map((pkg) => (
              <div
                key={pkg.id}
                className={`package-card ${
                  selectedService?.id === pkg.id ? "selected" : ""
                }`}
                onClick={() => handleServiceSelect(pkg)}
              >
                <h4>{pkg.name}</h4>
                <p className="price">₱{pkg.price}</p>
                <ul>
                  {(pkg.inclusions || "")
                    .split("\n")
                    .filter(Boolean)
                    .map((item, i) => (
                      <li key={i}>✔ {item}</li>
                    ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="step-buttons">
            <button className="back-btn" onClick={() => setStep(1)}>
              <FaArrowLeft /> Back
            </button>
            <button
              className="next-btn"
              onClick={() => setStep(3)}
              disabled={!selectedService}
            >
              Next <FaArrowRight />
            </button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="step-content">
          <h3>3. Review & Book</h3>
          <div className="form-card review-card">
            <p><strong>Event:</strong> {form.event_name}</p>
            <p><strong>Type:</strong> {form.event_type}</p>
            <p><strong>Venue Type:</strong> {form.venue_type}</p>
            <p><strong>Date:</strong> {form.call_date}</p>
            <p><strong>Call Time:</strong> {form.call_time}</p>
            <p><strong>Start Time:</strong> {form.start_time}</p>
            <p><strong>End Time:</strong> {form.end_time}</p>
            <p><strong>Location:</strong> {`${form.purok}, ${form.barangay}, ${form.city}, ${form.province}`}</p>

            {selectedService && (
              <>
                <p><strong>Package:</strong> {selectedService.name}</p>
                <p><strong>Price:</strong> ₱{selectedService.price}</p>
              </>
            )}

            <label>Upload Proof of Down Payment *</label>
            <input
              type="file"
              name="down_payment"
              accept="image/*"
              onChange={handleChange}
            />
          </div>

          <div className="step-buttons">
            <button className="back-btn" onClick={() => setStep(2)}>
              <FaArrowLeft /> Back
            </button>
            <button className="submit-btn" onClick={handleSubmit}>
              <FaPaperPlane /> Submit Reservation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservation;
