import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaArrowLeft,
  FaPaperPlane,
  FaPlus,
  FaMinus,
  FaCheckCircle,
} from "react-icons/fa";
import "../../css/usernav/Reservation.css";

const Reservation = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [packages, setPackages] = useState([]);
  const [customs, setCustoms] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedCustoms, setSelectedCustoms] = useState([]);

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

  // === FETCH SERVICES ===
  useEffect(() => {
    axios
      .get("/api/services")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        const normalized = data.map((s) => ({
          ...s,
          type: s.type || "package",
          down_payment: s.down_payment ?? s.downPayment ?? 0,
          balance: s.balance ?? 0,
        }));
        setPackages(normalized.filter((s) => s.type === "package"));
        setCustoms(normalized.filter((s) => s.type === "custom"));
      })
      .catch(() => {
        setPackages([]);
        setCustoms([]);
      });
  }, []);

  // === HANDLE FORM CHANGES ===
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) setForm({ ...form, [name]: files[0] });
    else setForm({ ...form, [name]: value });
  };

  // === STEP 1 VALIDATION ===
  const validateStep1 = () => {
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

    const missing = requiredFields.filter(
      (field) => !form[field] || form[field].trim() === ""
    );

    if (missing.length > 0) {
      alert("Please fill out all fields before proceeding to the next step.");
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  // === CUSTOM SERVICE QUANTITY CONTROLS ===
  const increment = (service) => updateQuantity(service, 1);
  const decrement = (service) => updateQuantity(service, -1);

  const updateQuantity = (service, delta) => {
    setSelectedCustoms((prev) => {
      const existing = prev.find((s) => s.id === service.id);
      if (existing) {
        const updated = prev
          .map((s) =>
            s.id === service.id
              ? { ...s, quantity: Math.max(0, s.quantity + delta) }
              : s
          )
          .filter((s) => s.quantity > 0);
        return updated;
      } else if (delta > 0) {
        return [...prev, { ...service, quantity: 1 }];
      }
      return prev;
    });
  };

  // === CALCULATE TOTALS ===
  const totalPrice =
    (selectedService ? selectedService.price : 0) +
    selectedCustoms.reduce((sum, s) => sum + s.price * s.quantity, 0);

  const totalDownPayment =
    (selectedService ? selectedService.down_payment : 0) +
    selectedCustoms.reduce((sum, s) => sum + s.down_payment * s.quantity, 0);

  // === SUBMIT ===
  const handleSubmit = async () => {
    if (!form.down_payment) {
      alert("Please upload a proof of down payment before submitting.");
      return;
    }

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      if (selectedService) fd.append("service_id", selectedService.id);
      if (selectedCustoms.length > 0)
        fd.append("custom_services", JSON.stringify(selectedCustoms));

      const res = await axios.post("/api/reservations", fd);
      alert(`Reservation created successfully! Reference ID: ${res.data.id}`);
      navigate("/userdashboard/home");
    } catch (err) {
      console.error(err);
      alert("Failed to create reservation. Please try again.");
    }
  };

  return (
    <div className="reservation-wrapper">
      <h2 className="page-title">New Event Reservation</h2>

      {/* === STEP INDICATOR === */}
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

      {/* === STEP 1: DETAILS === */}
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
            <button className="next-btn" onClick={handleNextStep}>
              Next <FaArrowRight />
            </button>
          </div>
        </div>
      )}

      {/* === STEP 2 === */}
      {step === 2 && (
        <div className="reservation-step-content">
          <h3>2. Choose Your Service Package & Custom Options</h3>

          {/* === PACKAGE LIST === */}
          <h4>Service Packages</h4>
          <div className="reservation-package-list">
            {packages.map((pkg) => (
              <label
                key={pkg.id}
                className={`reservation-option ${
                  selectedService?.id === pkg.id ? "selected" : ""
                }`}
              >
                <input
                  type="checkbox"
                  name="service_package"
                  checked={selectedService?.id === pkg.id}
                  onChange={() =>
                    setSelectedService(
                      selectedService?.id === pkg.id ? null : pkg
                    )
                  }
                />
                <div className="reservation-details">
                  <div className="reservation-header">
                    <span className="reservation-name">{pkg.name}</span>
                    <span className="reservation-price">
                      ₱ {pkg.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="reservation-inclusions">
                    <strong>Includes:</strong>{" "}
                    {(pkg.inclusions || "")
                      .split("\n")
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                  <p>
                    <strong>Down Payment:</strong> ₱ {pkg.down_payment}
                  </p>
                </div>
              </label>
            ))}
          </div>

          {/* === CUSTOM SERVICES === */}
          <h4>Custom Services</h4>
          <div className="reservation-package-list">
            {customs.map((custom) => {
              const selected = selectedCustoms.find((s) => s.id === custom.id);
              return (
                <div key={custom.id} className="reservation-option">
                  <div className="reservation-details">
                    <div className="reservation-header">
                      <span className="reservation-name">{custom.name}</span>
                      <span className="reservation-price">
                        ₱ {custom.price.toLocaleString()}
                      </span>
                    </div>
                    <p>
                      <strong>Description:</strong>{" "}
                      {custom.description || "No description available."}
                    </p>
                    <p>
                      <strong>Down Payment:</strong> ₱ {custom.down_payment}
                    </p>
                    <div className="quantity-control">
                      <button onClick={() => decrement(custom)}>
                        <FaMinus />
                      </button>
                      <span>{selected?.quantity || 0}</span>
                      <button onClick={() => increment(custom)}>
                        <FaPlus />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* === TOTALS === */}
          <div className="totals-summary">
            <p>
              <strong>Total Price:</strong> ₱ {totalPrice.toLocaleString()}
            </p>
            <p>
              <strong>Total Down Payment:</strong> ₱{" "}
              {totalDownPayment.toLocaleString()}
            </p>
          </div>

          <div className="step-buttons">
            <button className="back-btn" onClick={() => setStep(1)}>
              <FaArrowLeft /> Back
            </button>
            <button
              className="next-btn"
              onClick={() => setStep(3)}
              disabled={!selectedService && selectedCustoms.length === 0}
            >
              Next <FaArrowRight />
            </button>
          </div>
        </div>
      )}

      {/* === STEP 3 === */}
      {step === 3 && (
        <div className="step-content">
          <h3>3. Review & Book</h3>

          {/* === Down Payment Box === */}
          <div className="downpayment-box">
            <label className="downpayment">
              Required Down Payment: ₱ {totalDownPayment.toLocaleString()}
            </label>
            <p className="downpayment-reminder">
              The remaining balance will be paid <strong>in person</strong> on
              the day of the event.
            </p>
            <p className="downpayment-detail">
              This down payment is required to secure your date. Please complete
              the payment via bank transfer or deposit <strong>before</strong>{" "}
              submitting this form.
            </p>

            <div className="payment-card">
              <h4 className="payment-title">Payment Details</h4>
              <ul>
                <li>Bank: GCash</li>
                <li>Account Name: Desie Torrenueva</li>
                <li>Account Number: 09380769988</li>
              </ul>
            </div>

            <div className="upload-section">
              <label className="upload-label">
                Upload Proof of Down Payment
              </label>
              <p className="mandatory">
                <strong>Mandatory:</strong> Attach a clear image (JPG or PNG) of
                your deposit slip or transfer confirmation.
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

          {/* === Review Card === */}
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
              <strong>Location:</strong>{" "}
              {`${form.purok}, ${form.barangay}, ${form.city}, ${form.province}`}
            </p>

            <hr />

            {/* === CONDITIONAL SERVICE DISPLAY === */}
            {(selectedService || selectedCustoms.length > 0) ? (
              <>
                <h4 className="review-title">Selected Services</h4>

                {/* === MAIN PACKAGE === */}
                {selectedService && (
                  <>
                    <h5 className="review-subtitle">Service Package</h5>
                    <p>
                      <strong>Package:</strong> {selectedService.name}
                    </p>
                    <p>
                      <strong>Price:</strong> ₱{" "}
                      {selectedService.price.toLocaleString()}
                    </p>
                    <p>
                      <strong>Down Payment:</strong> ₱{" "}
                      {selectedService.down_payment.toLocaleString()}
                    </p>
                  </>
                )}

                {/* === CUSTOM SERVICES === */}
                {selectedCustoms.length > 0 && (
                  <>
                    {selectedService && <hr />}
                    <h5 className="review-subtitle">Custom Services</h5>
                    <ul className="custom-service-list">
                      {selectedCustoms.map((c) => (
                        <li key={c.id}>
                          <FaCheckCircle className="check-icon" /> {c.name} ×{" "}
                          {c.quantity} — ₱
                          {(c.price * c.quantity).toLocaleString()} (Down ₱
                          {(c.down_payment * c.quantity).toLocaleString()})
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            ) : (
              <p className="no-service-text">
                <em>No service selected.</em>
              </p>
            )}

            <hr />

            {/* === PAYMENT BREAKDOWN === */}
            {(selectedService || selectedCustoms.length > 0) && (
              <>
                <h4 className="review-title">Payment Breakdown</h4>
                <p>
                  <strong>Total Price:</strong> ₱ {totalPrice.toLocaleString()}
                </p>
                <p>
                  <strong>Total Down Payment:</strong> ₱{" "}
                  {totalDownPayment.toLocaleString()}
                </p>
                <p>
                  <strong>Balance Due (in person):</strong> ₱{" "}
                  {(totalPrice - totalDownPayment).toLocaleString()}
                </p>
                <p className="note">
                  The balance due will be collected on the event day.
                </p>
              </>
            )}
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
