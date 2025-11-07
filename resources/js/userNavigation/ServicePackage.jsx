import React, { useEffect, useState } from "react";
import axios from "axios";
import { IoClose } from "react-icons/io5";
import "../../css/usernav/ServicePackage.css";

const ServicePackage = () => {
  const [packages, setPackages] = useState([]);
  const [customs, setCustoms] = useState([]);
  const [imageView, setImageView] = useState(null);
  const [selected, setSelected] = useState(null); 

  useEffect(() => {
    axios
      .get("/api/services")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        const normalized = data.map((s) => ({
          ...s,
          type: s.type || "package",
          downPayment: s.down_payment ?? s.downPayment ?? 0,
          balance: s.balance ?? 0,
        }));

        setPackages(normalized.filter((s) => s.type === "package"));
        setCustoms(normalized.filter((s) => s.type === "custom"));
      })
      .catch((err) => {
        console.error("Error fetching services:", err);
        setPackages([]);
        setCustoms([]);
      });
  }, []);
  
  const handleCloseImage = () => setImageView(null);
  const handleCloseModal = () => setSelected(null);

  return (
    <div className="package-section">
      <h1 className="package-main-title">Explore Our Services</h1>

      {/* === SERVICE PACKAGES === */}
      <div className="package-category">
        <h2 className="package-sub-title">Service Packages & Pricing</h2>
        <hr />
        <div className="package-container">
          {packages.map((pkg) => (
            <div key={pkg.id} className="package-card">
              {pkg.image_url && (
                <div className="package-img-box">
                  <img src={pkg.image_url} alt={pkg.name} className="package-img"  onClick={() => setImageView(pkg.image_url)}/>
                </div>
              )}
              <h3 className="package-name" onClick={() => setSelected(pkg)}>
                {pkg.name}
              </h3>
              <p className="package-price">₱ {pkg.price.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* === CUSTOM SERVICES === */}
      <div className="package-category">
        <h2 className="category-title">Custom Builder & Pricing</h2>
        <hr />
        <div className="package-container">
          {customs.map((pkg) => (
            <div key={pkg.id} className="package-card">
              {pkg.image_url && (
                <div className="package-img-box">
                  <img src={pkg.image_url} alt={pkg.name} className="package-img" onClick={() => setImageView(pkg.image_url)}/>
                </div>
              )}
              <h3 className="package-name" onClick={() => setSelected(pkg)}>
                {pkg.name}
              </h3>
              <p className="package-price">₱ {pkg.price.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* === MODAL (POPUP CARD) === */}
      {selected && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="service-close" onClick={handleCloseModal}>
              <IoClose />
            </button>
            <h2>{selected.name}</h2>
            <p><strong>Total Price:</strong> ₱{selected.price.toLocaleString()}</p>
            <p><strong>Down Payment:</strong> ₱{selected.downPayment}</p>

            {selected.type === "package" ? (
              <>
                <p><strong>Inclusions:</strong></p>
                <ul>
                  {(selected.inclusions || "")
                    .split("\n")
                    .filter(Boolean)
                    .map((i, idx) => (
                      <li key={idx}>{i}</li>
                    ))}
                </ul>
              </>
            ) : (
              <>
                <p><strong>Description:</strong></p>
                <p>{selected.description || "No description provided."}</p>
              </>
            )}

            {selected.note && <p><strong>Note:</strong> {selected.note}</p>}
            {selected.balance > 0 && (
              <p><strong>Balance:</strong> ₱{selected.balance.toLocaleString()}</p>
            )}
          </div>
        </div>
      )}
            {imageView && (
        <div className="image-overlay" onClick={handleCloseImage}>
          <div className="image-modal" onClick={(e) => e.stopPropagation()}>
            <button className="image-close" onClick={handleCloseImage}>
              <IoClose />
            </button>
            <img src={imageView} alt="Full view" className="image-preview" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicePackage;
