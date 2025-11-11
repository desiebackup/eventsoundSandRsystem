import React from "react";
import "../../../css/usernav/dropdown/ContactUs.css"; // ✅ correct CSS path
import contactImg from "../../../img/contactillustration.jpg"; // ✅ correct image path
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";


export default function ContactUs() {
  return (
      <div className="contact-card">
        <h2 className="contact-title">Get in Touch</h2>
        <img src={contactImg} alt="Contact illustration" className="contact-image" />

        <div className="contact-details">
          <p><FaPhoneAlt className="icon" /> 09366811261</p>
          <p><FaEnvelope className="icon" /> grouptwo@gmail.com</p>
          <p><FaMapMarkerAlt className="icon" /> Poblacion, Trinidad, Bohol</p>
        </div>
      </div>
  );
}
