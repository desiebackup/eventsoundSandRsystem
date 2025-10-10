import React from "react";
import "../../css/usernav/ServicePackage.css";

const ServicePackage = () => {
  const packages = [
    {
      name: "Basic",
      price: "2000",
      features: ["Speakers", "Wired Microphone", "DJ Mixer"],
    },
    {
      name: "Standard",
      price: "3000",
      features: ["Speakers", "Wireless Microphone", "DJ with Lightning Effects"],
    },
    {
      name: "Premium",
      price: "5000",
      features: [
        "Full Sound Setup",
        "Professional DJ",
        "Smoke & Lightning Effects",
      ],
    },
  ];

  return (
    <div className="package-section">
      <div className="package-container">
        {packages.map((pkg, index) => (
          <div key={index} className="package-card">
            <div className="package-header">
              <h3>{pkg.name}</h3>
              <div className="package-price">{pkg.price}</div>
            </div>

            <ul className="package-features">
              {pkg.features.map((feature, i) => (
                <li key={i}>
                  <span className="checkmark">✔</span> {feature}
                </li>
              ))}
            </ul>

            <button className="book-btn">Book Now</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicePackage;
