import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/usernav/ServicePackage.css";

const ServicePackage = () => {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    event_name: "",
    service_package: "",
    venue: "",
    address: "",
    call_time: "",
    down_payment: null,
  });
  const [openFormId, setOpenFormId] = useState(null);

  useEffect(() => {
    axios
      .get("/api/services")
      .then((res) => setServices(res.data))
      .catch(() => setServices([]));
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleBook = async (pkgName) => {
    try {
      const fd = new FormData();
      fd.append("event_name", form.event_name || `${pkgName} Booking`);
      fd.append("service_package", pkgName);
      fd.append("venue", form.venue || "TBD");
      fd.append("address", form.address || "TBD");
      fd.append("call_time", form.call_time || "TBD");
      if (form.down_payment) fd.append("down_payment", form.down_payment);

      const res = await axios.post("/api/reservations", fd, {
        // Let axios/browser set the Content-Type with the proper boundary
      });

      alert("Reservation created: " + res.data.id);
    } catch (err) {
      console.error(err);
      alert("Failed to create reservation");
    }
  };

  return (
    <div className="package-section">
      <div className="package-container">
        {services.map((pkg) => (
          <div key={pkg.id} className="package-card">
            <div className="package-header">
              <h3>{pkg.name}</h3>
              <div className="package-price">{pkg.price}</div>
            </div>

            <ul className="package-features">
              {(pkg.inclusions || "").split('\n').filter(Boolean).map((feature, i) => (
                <li key={i}>
                  <span className="checkmark">✔</span> {feature}
                </li>
              ))}
              {(!pkg.inclusions || pkg.inclusions.trim() === "") && <li className="muted">No inclusions listed</li>}
            </ul>

            {pkg.note ? (
              <div className="package-note" style={{ marginTop: 8 }}>         
                <div>{pkg.note}</div>
              </div>
            ) : null}

            {openFormId === pkg.id ? (
              <div style={{ marginTop: 8 }}>
                <input type="text" name="event_name" placeholder="Event name" onChange={handleChange} />
                <input type="text" name="venue" placeholder="Venue" onChange={handleChange} />
                <input type="text" name="address" placeholder="Address" onChange={handleChange} />
                <input type="text" name="call_time" placeholder="Call time" onChange={handleChange} />
                <input type="file" name="down_payment" accept="image/*" onChange={handleChange} />

                <div style={{ marginTop: 10 }}>
                  <button className="book-btn" onClick={() => handleBook(pkg.name)}>
                    Confirm Reservation
                  </button>
                  <button className="book-cancel" onClick={() => setOpenFormId(null)} style={{ marginLeft: 8 }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 12 }}>
                <button className="book-btn" onClick={() => window.location.href = `/userdashboard/makereservation?package=${encodeURIComponent(pkg.name)}`}>
                  Book Now
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicePackage;
