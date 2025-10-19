import React, { useState, useEffect } from "react";
import "../../css/adminnav/Payments.css";

export default function Payments() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    // Example static data (replace with axios.get('/api/payments'))
    const mockData = [
      { id: 1, user: "Desie Torrenueva", amount: 1200, method: "GCash", date: "2025-10-15" },
      { id: 2, user: "Carl Dela Cruz", amount: 900, method: "PayPal", date: "2025-10-16" },
      { id: 3, user: "Ella Santos", amount: 1500, method: "Bank Transfer", date: "2025-10-18" },
    ];
    setPayments(mockData);
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Payments</h1>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <table className="min-w-full text-left border-collapse">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-6 py-3 text-sm font-semibold">#</th>
              <th className="px-6 py-3 text-sm font-semibold">User</th>
              <th className="px-6 py-3 text-sm font-semibold">Amount</th>
              <th className="px-6 py-3 text-sm font-semibold">Method</th>
              <th className="px-6 py-3 text-sm font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment, index) => (
              <tr
                key={payment.id}
                className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                <td className="px-6 py-3">{payment.id}</td>
                <td className="px-6 py-3">{payment.user}</td>
                <td className="px-6 py-3">₱{payment.amount}</td>
                <td className="px-6 py-3">{payment.method}</td>
                <td className="px-6 py-3">{payment.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
