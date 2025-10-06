import React from "react";
import "../../css/usernav/SoundPackage.css";

const SoundPackage = () => {
  return (
    <div className="sound-package-container">
      <h2 className="sound-package-title">Sound Packages</h2>
      <p className="sound-package-subtitle">Choose from our available packages.</p>

      <div className="package-list">
        <div className="package-card">
          <h3>Basic Package</h3>
          <p>Includes speakers and microphones for small events.</p>
        </div>
        <div className="package-card">
          <h3>Premium Package</h3>
          <p>Includes full sound system with lighting effects.</p>
        </div>
        <div className="package-card">
          <h3>Deluxe Package</h3>
          <p>Professional audio setup with stage and technician.</p>
        </div>
      </div>
    </div>
  );
};

export default SoundPackage;
