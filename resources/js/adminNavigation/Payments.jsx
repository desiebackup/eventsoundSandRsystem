import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../css/adminnav/Payments.css";

export default function Payments() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    // fetch services first so we can reliably look up prices by id or name
    axios.get('/api/services')
      .then(sres => {
        const services = sres.data || [];
        const byId = {};
        const byName = {};
        services.forEach(s => {
          if (s?.id) byId[String(s.id)] = s;
          if (s?.name) byName[(s.name || '').toLowerCase().trim()] = s;
        });

        return axios.get('/api/reservations')
          .then(r => {
            const rows = r.data
              .filter(x => x.status === 'approved')
              .map((res) => {
                // prefer server-side relation if provided
                let price = null;
                if (res.service && typeof res.service.price !== 'undefined') price = res.service.price;
                // fallback to service_id lookup
                if (price === null && res.service_id && byId[String(res.service_id)]) price = byId[String(res.service_id)].price;
                // fallback to service_package name lookup
                if (price === null && res.service_package) {
                  const rname = (res.service_package || '').toLowerCase().trim();
                  if (byName[rname]) price = byName[rname].price;
                }

                return {
                  id: res.id,
                  user: `${res.user?.firstname} ${res.user?.lastname}`,
                  amount: price,
                  method: 'GCash',
                  date: res.approved_at,
                };
              });
            setPayments(rows);
          });
      })
      .catch(() => setPayments([]));
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <table className="min-w-full text-left border-collapse">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-6 py-3 text-sm font-semibold">ID</th>
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
