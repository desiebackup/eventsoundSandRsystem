// resources/js/components/Preloader.jsx
import React from "react";
import "../../css/design/Preloader.css"; // create this file next

export default function Preloader() {
  return (
    <div className="preloader">
      <img
        src="/images/logo.png" // 🖼️ replace with your logo path
        alt="Loading..."
        className="preloader-logo"
      />
    </div>
  );
}
