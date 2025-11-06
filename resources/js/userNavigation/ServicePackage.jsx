import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../css/usernav/ServicePackage.css";

const ServicePackage = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);

useEffect(() => {
  axios
    .get("/api/services")
    .then((res) => {
      const normalized = (res.data || []).map((s) => ({
        ...s,
        downPayment: s.down_payment ?? s.downPayment ?? 0,
        balance: s.balance ?? s.balance ?? 0,
      }));
      setServices(normalized);
    })
    .catch(() => setServices([]));
}, []);

  return (
    <div className="package-section">
      {/* ✅ HEADER SECTION */}
      <h1 className="package-main-title">Explore Our Packages</h1>

      <div className="package-header-box">
        <h2 className="package-sub-title">Service Packages & Pricing</h2>
        <hr />
        <p className="package-description">
          Choose the perfect service package for your event.{" "}
          <b>
            The price listed includes total cost, down payment, and balance
            details.
          </b>
        </p>
      </div>

      {/* ✅ PACKAGE LIST */}
      <div className="package-container">
        {services.map((pkg) => (
          <div key={pkg.id} className="package-card">
            {/* === Header + Price === */}
            <div className="package-header">
              <h3>{pkg.name}</h3>
              <div className="price-label">Total Full Amount:</div>
              <div className="package-price">
                ₱ {pkg.price}
                {pkg.downPayment ? (
                  <>
                    <div className="price-caption">Required Down Payment</div>
                    <div className="muted">₱ {pkg.downPayment}</div>
                    <hr/>
                  </>
                ) : (
                  <div className="muted">No Down Payment</div>
                )}
              </div>
            </div>

            {/* === Inclusions === */}
            <ul className="package-features">
              {(pkg.inclusions || "")
                .split("\n")
                .filter(Boolean)
                .map((feature, i) => (
                  <li key={i}>
                    <span className="checkmark">✔</span> {feature}
                  </li>
                ))}
              {(!pkg.inclusions || pkg.inclusions.trim() === "") && (
                <li className="muted">No inclusions listed</li>
              )}
            </ul>

            {/* === Notes + Balance === */}
            {pkg.note ? (
              <div className="package-note" style={{ marginTop: 8 }}>
                <div>{pkg.note}</div>
                {pkg.balance && (
                  <div className="muted" style={{ marginTop: 4 }}>
                    Balance Due In-Person: ₱{pkg.balance}
                  </div>
                )}
              </div>
            ) : (
              <div className="muted" style={{ marginTop: 8 }}>
                No notes available
              </div>
            )}

            {/* ✅ BOOK NOW BUTTON — GO TO Reservation.jsx */}
            <div>
              <button
                className="book-btn"
                onClick={() =>
                  navigate(`/userdashboard/reservations`, {
                    state: { packageName: pkg.name },
                  })
                }
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicePackage;