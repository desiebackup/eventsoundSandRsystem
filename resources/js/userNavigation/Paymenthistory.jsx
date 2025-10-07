import React from "react";
import "../../css/usernav/Paymenthistory.css";

const PaymentHistory = () => {
  return (
    <div className="payment-history-container">
      <p className="payment-history-subtitle">Track your past payments.</p>

      <table className="payment-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Event</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan="4" className="empty-row">
              No payment records yet.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PaymentHistory;
