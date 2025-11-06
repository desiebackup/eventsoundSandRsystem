import React, { useState } from "react";
import "../../css/usernav/Payment.css";

const Payments = () => {
  const [bankDetails, setBankDetails] = useState({
    bankName: "BPI Savings",
    accountNumber: "7890",
    accountName: "Imee Palmero",
  });

  const [showModal, setShowModal] = useState(false);

  const invoices = [
    {
      id: "ORD-001",
      event: "Summit Conference",
      total: 2000,
      down: 150,
      balance: 1850,
      status: "Paid in Full",
      action: "Download Invoice",
    },
    {
      id: "ORD-002",
      event: "Birthday Party",
      total: 600,
      down: 150,
      balance: 450,
      status: "Balance Due",
      action: "Pay In Person",
    },
    {
      id: "ORD-003",
      event: "Wedding",
      total: 1000,
      down: 100,
      balance: 0,
      status: "Canceled",
      action: "Refund Sent",
    },
  ];

  const handleSave = () => {
    setShowModal(false);
  };

  return (
    <div className="pay-wrapper">
      <h2 className="pay-title">Payment & Invoice Center</h2>

      {/* Final Balance Due */}
      <div className="balance-box">
        <p className="balance-label">Final Balance Due (Upcoming)</p>
        <h1 className="balance-amount">$450.00</h1>
        <p className="balance-info">
          Remaining balance for <b>Holiday Staff Party</b> (Due Dec 10, <b>In-Person</b>).
        </p>
        <button className="view-details-btn">View Details</button>
      </div>

      {/* Refund Method */}
      <div className="refund-box">
        <h3 className="section-title">Default Refund Method (For Manual Transfers)</h3>

        <div className="refund-row">
          <div>
            <p className="refund-bank">
              <b>{bankDetails.bankName}</b> (Account Ending: {bankDetails.accountNumber})
            </p>
            <p className="refund-name">Account Name: {bankDetails.accountName}</p>
          </div>

          <button className="update-btn" onClick={() => setShowModal(true)}>
            Update Details
          </button>
        </div>

        <p className="refund-note">
          All manual refunds (e.g., cancellations) will be sent to this account.
        </p>
      </div>

      {/* Invoice History */}
      <h3 className="section-title">Invoice History</h3>

      <div className="invoice-table">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Event Name</th>
              <th>Total Amount</th>
              <th>Down Payment</th>
              <th>Balance Due</th>
              <th>Status</th>
              <th>Action / Refund Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, i) => (
              <tr key={i}>
                <td>{inv.id}</td>
                <td>{inv.event}</td>
                <td>${inv.total.toFixed(2)}</td>
                <td className="paid-text">${inv.down.toFixed(2)}</td>
                <td className={inv.balance > 0 ? "due-text" : "zero-text"}>
                  ${inv.balance.toFixed(2)}
                </td>
                <td>
                  <span
                    className={`status-badge ${
                      inv.status === "Paid in Full"
                        ? "paid"
                        : inv.status === "Balance Due"
                        ? "due"
                        : "canceled"
                    }`}
                  >
                    {inv.status}
                  </span>
                </td>
                <td className="action-text">{inv.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Update Refund Details</h3>

            <input
              type="text"
              value={bankDetails.bankName}
              onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
              placeholder="Bank Name"
            />

            <input
              type="text"
              value={bankDetails.accountNumber}
              onChange={(e) =>
                setBankDetails({ ...bankDetails, accountNumber: e.target.value })
              }
              placeholder="Account Number"
            />

            <input
              type="text"
              value={bankDetails.accountName}
              onChange={(e) =>
                setBankDetails({ ...bankDetails, accountName: e.target.value })
              }
              placeholder="Account Holder Name"
            />

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleSave}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;