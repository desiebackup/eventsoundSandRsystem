import React from "react";
import "../../css/usernav/ServicePackage.css";

const ServicePackage = () => {
  return (
    <div className="package-container">
      <h1>Sound Packages</h1>
      <p>Select the best package that fits your event.</p>

      <div className="package-grid">
        <div className="package-card">
          <h3>Basic Package</h3>
          <ul>
            <li>2 Speakers</li>
            <li>1 Microphone</li>
            <li>DJ Mixer</li>
          </ul>
          <button className="book-btn">Book Now</button>
        </div>

        <div className="package-card">
          <h3>Premium Package</h3>
          <ul>
            <li>4 Speakers</li>
            <li>2 Wireless Mics</li>
            <li>DJ with Lighting Effects</li>
          </ul>
          <button className="book-btn">Book Now</button>
        </div>

        <div className="package-card">
          <h3>VIP Package</h3>
          <ul>
            <li>Full Sound Setup</li>
            <li>Professional DJ</li>
            <li>Smoke & Lighting Effects</li>
          </ul>
          <button className="book-btn">Book Now</button>
        </div>
      </div>
    </div>
  );
};

export default ServicePackage;
