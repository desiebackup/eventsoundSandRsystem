import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../css/adminnav/Payments.css";

export default function Payments() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    axios
      .get("/api/services")
      .then((sres) => {
        const services = sres.data || [];
        const byId = {};
        const byName = {};

        services.forEach((s) => {
          if (s?.id) byId[String(s.id)] = s;
          if (s?.name) byName[(s.name || "").toLowerCase().trim()] = s;
        });

        return axios.get("/api/reservations").then((r) => {
          const rows = r.data.map((res) => {
            let price = null;
            if (res.service && typeof res.service.price !== "undefined")
              price = res.service.price;
            if (price === null && res.service_id && byId[String(res.service_id)])
              price = byId[String(res.service_id)].price;
            if (price === null && res.service_package) {
              const rname = (res.service_package || "").toLowerCase().trim();
              if (byName[rname]) price = byName[rname].price;
            }

            const downPayment = price ? price * 0.3 : 0;

            return {
              id: res.id,
              user: `${res.user?.firstname} ${res.user?.lastname}`,
              totalPrice: price,
              downPayment: downPayment,
              status: res.payment_status || "unpaid",
              method: "GCash",
              date: res.approved_at || "-",
            };
          });
          setPayments(rows);
        });
      })
      .catch(() => setPayments([]));
  }, []);

  const handlePaid = (id) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: "paid" } : p
      )
    );
  };

  const handleRefund = (id) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: "refunded" } : p
      )
    );
  };

  return (
    <div className="payments-page">

      <div className="payments-container">
        <table className="payments-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Total Price</th>
              <th>Down Payment</th>
              <th>Status</th>
              <th>Method</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">
                  No payment records found.
                </td>
              </tr>
            ) : (
              payments.map((payment, index) => (
                <tr key={payment.id}>
                  <td>{payment.id}</td>
                  <td>{payment.user}</td>
                  <td>₱{payment.totalPrice?.toLocaleString()}</td>
                  <td>₱{payment.downPayment?.toLocaleString()}</td>
                  <td>
                    <span
                      className={`status-badge ${payment.status.toLowerCase()}`}
                    >
                      {payment.status.charAt(0).toUpperCase() +
                        payment.status.slice(1)}
                    </span>
                  </td>
                  <td>{payment.method}</td>
                  <td>{payment.date}</td>
                  <td className="action-buttons">
                    <button
                      className="btn-paid"
                      onClick={() => handlePaid(payment.id)}
                      disabled={payment.status === "paid"}
                    >
                      Paid
                    </button>
                    <button
                      className="btn-refund"
                      onClick={() => handleRefund(payment.id)}
                      disabled={payment.status === "refunded"}
                    >
                      Refund
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}