import React from "react";
import "../../css/usernav/Reservation.css";

const Reservation = () => {
  return (
    <div className="reservation-container">
      <h1>My Reservations</h1>
      <p>View and manage your sound system bookings below.</p>

      <div className="reservation-list">
        <div className="reservation-card">
          <h3>Wedding Event</h3>
          <p>Date: December 15, 2025</p>
          <p>Status: Confirmed</p>
          <button className="cancel-btn">Cancel Reservation</button>
        </div>

        <div className="reservation-card">
          <h3>Birthday Party</h3>
          <p>Date: January 8, 2026</p>
          <p>Status: Pending</p>
          <button className="cancel-btn">Cancel Reservation</button>
        </div>
      </div>
    </div>
  );
};

export default Reservation;
