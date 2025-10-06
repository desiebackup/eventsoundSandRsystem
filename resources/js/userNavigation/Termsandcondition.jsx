import React from "react";
import "../../css/usernav/Termsandcondition.css";

const TermsAndCondition = () => {
  return (
    <div className="terms-container">
      <h2 className="terms-title">Terms and Conditions</h2>
      <p className="terms-subtitle">
        Please read our terms and conditions carefully.
      </p>

      <div className="terms-box">
        <p>
          1. By using this system, you agree to our policies regarding event
          reservations and payments.
        </p>
        <p>
          2. All bookings are subject to availability and confirmation by the
          administrator.
        </p>
        <p>
          3. Users must ensure their payment details are accurate and up to
          date.
        </p>
        <p>
          4. Cancellations made less than 24 hours before the event are non-refundable.
        </p>
      </div>
    </div>
  );
};

export default TermsAndCondition;
