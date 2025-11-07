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
    if (!form.down_payment) {
      alert("Please upload a proof of down payment before submitting.");
      return;
    }

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      if (selectedService) fd.append("service_id", selectedService.id);

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
            {i < 2 && (
              <div
                className={`step-line ${step > s.num ? "filled" : ""}`}
              ></div>
            )}
          </div>
        ))}
      </div>
      <hr />

      {/* STEP 1 */}
      {step === 1 && (
        <div className="step-content">
          <div className="form-card">
            <h3>1. Tell Us About Your Event</h3>
            <label>Event Name</label>
            <input
              type="text"
              name="event_name"
              value={form.event_name}
              onChange={handleChange}
              placeholder="e.g., Shane’s Birthday"
            />

            <label>Event Type</label>
            <select
              name="event_type"
              value={form.event_type}
              onChange={handleChange}
            >
              <option value="">Select event type</option>
              <option value="Birthday">Birthday</option>
              <option value="Wedding">Wedding</option>
              <option value="Concert">Concert</option>
              <option value="Corporate">Corporate</option>
              <option value="Other">Other</option>
            </select>

            <label>Venue Type</label>
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
                <label>Call Time</label>
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
                <label>Start Time</label>
                <input
                  type="time"
                  name="start_time"
                  value={form.start_time}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>End Time</label>
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
            />

            <label>Location</label>
            <div className="location-grid">
              <input
                type="text"
                name="purok"
                value={form.purok}
                onChange={handleChange}
                placeholder="Purok"
              />
              <input
                type="text"
                name="barangay"
                value={form.barangay}
                onChange={handleChange}
                placeholder="Barangay"
              />
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Municipal/City"
              />
              <input
                type="text"
                name="province"
                value={form.province}
                onChange={handleChange}
                placeholder="Province"
              />
            </div>
          </div>

          <div className="step-buttons">
            <button
              className="next-btn"
              onClick={() => {
                const requiredFields = [
                  "event_name",
                  "event_type",
                  "venue_type",
                  "call_date",
                  "call_time",
                  "start_time",
                  "end_time",
                  "phone",
                  "purok",
                  "barangay",
                  "city",
                  "province",
                ];

                const emptyFields = requiredFields.filter(
                  (field) => !form[field]?.trim()
                );

                if (emptyFields.length > 0) {
                  alert(
                    "Please fill out all required fields before proceeding."
                  );
                  return;
                }

                setStep(2);
              }}
            >
              Next <FaArrowRight />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="reservation-step-content">
          <h3>2. Choose a Service Package</h3>

          <div className="reservation-package-list">
            {services.map((pkg) => (
              <label
                key={pkg.id}
                className={`reservation-option ${
                  selectedService?.id === pkg.id ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="service"
                  value={pkg.id}
                  checked={selectedService?.id === pkg.id}
                  onChange={() => handleServiceSelect(pkg)}
                />
                <div className="reservation-details">
                  <div className="reservation-header">
                    <span className="reservation-name">{pkg.name}</span>
                    <span className="reservation-price">
                      Total Price: ₱ {pkg.price}
                    </span>
                  </div>

                  <div className="reservation-inclusions">
                    Includes:{" "}
                    {(pkg.inclusions || "")
                      .split("\n")
                      .filter(Boolean)
                      .join(", ")}
                  </div>

                  <div className="reservation-downpayment">
                    <strong>Down Payment:</strong> ₱{" "}
                    {pkg.down_payment ?? pkg.downPayment ?? 0}
                  </div>
                </div>
              </label>
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

      {/* STEP 3 */}
      {step === 3 && (
        <div className="step-content">
          <h3>3. Review & Book</h3>

          {selectedService && (
            <>
              <div className="downpayment-box">
                <label className="downpayment">
                  Required Down Payment: ₱ {selectedService.down_payment ?? 0}
                </label>
                <p className="downpayment-reminder">
                  The remaining balance will be paid{" "}
                  <strong>in person</strong> on the day of the event.
                </p>
                <p className="downpayment-detail">
                  This down payment is required to secure your date. Please
                  complete the payment via bank transfer or deposit{" "}
                  <strong>before</strong> submitting this form.
                </p>

                <div className="payment-card">
                  <h4 className="payment-title">Payment Details</h4>
                  <ul>
                    <li>Bank: Gcash</li>
                    <li>Account Name: Desie Torrenueva</li>
                    <li>Account Number: 09380769988</li>
                  </ul>
                </div>

                <div className="upload-section">
                  <label className="upload-label">
                    Upload Proof of Down Payment
                  </label>
                  <p className="mandatory">
                    <strong>Mandatory:</strong> Attach a clear image (JPG or
                    PNG) of your deposit slip or transfer confirmation for the
                    down payment.
                  </p>
                  <input
                    type="file"
                    name="down_payment"
                    accept="image/*"
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-card review-card">
                <h4 className="review-title">Event and Services Summary</h4>
                <p>
                  <strong>Event Name:</strong> {form.event_name}
                </p>
                <p>
                  <strong>Type:</strong> {form.event_type}
                </p>
                <p>
                  <strong>Venue Type:</strong> {form.venue_type}
                </p>
                <p>
                  <strong>Date:</strong> {form.call_date}
                </p>
                <p>
                  <strong>Call Time:</strong> {form.call_time}
                </p>
                <p>
                  <strong>Start Time:</strong> {form.start_time}
                </p>
                <p>
                  <strong>End Time:</strong> {form.end_time}
                </p>
                <p>
                  <strong>Location:</strong>{" "}
                  {`${form.purok}, ${form.barangay}, ${form.city}, ${form.province}`}
                </p>

                <hr />
                <h4 className="review-title">Service Selected</h4>
                <p>
                  <strong>Package:</strong> {selectedService.name}
                </p>
                <p>
                  <strong>Inclusions:</strong>{" "}
                  {(selectedService.inclusions || "")
                    .split("\n")
                    .filter(Boolean)
                    .join(", ")}
                </p>

                <hr />
                <h4 className="review-title">Payment Breakdown</h4>
                <p>
                  <strong>Total Price:</strong> ₱{selectedService.price}
                </p>
                <p>
                  <strong>Down Payment:</strong> ₱
                  {selectedService.down_payment ?? 0}
                </p>
                <p>
                  <strong>Balance Due (in person):</strong> ₱
                  {selectedService.price -
                    (selectedService.down_payment ?? 0)}
                </p>
                <p className="note">
                  The balance due will be collected on the event day.
                </p>
              </div>
            </>
          )}

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
