// resources/js/userNavigation/Payments.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/usernav/Payment.css";  

export default function Payments() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    let serviceMap = {};
    axios.get('/api/services')
      .then(sres => {
        // create multiple lookup keys for resilience: original, lowercased, trimmed
        sres.data.forEach(s => {
          if (!s || !s.name) return;
          serviceMap[s.name] = s.price;
          serviceMap[(s.name || '').toLowerCase().trim()] = s.price;
        });
        return axios.get('/api/reservations');
      })
      .then(r => {
        const rows = r.data.map(res => {
          // try exact match, then lowercase match
          let amount = null;
          if (res.service_package && serviceMap.hasOwnProperty(res.service_package)) {
            amount = serviceMap[res.service_package];
          } else if (res.service_package && serviceMap.hasOwnProperty((res.service_package || '').toLowerCase().trim())) {
            amount = serviceMap[(res.service_package || '').toLowerCase().trim()];
          } else {
            // fallback: if service_package looks like an ID number, try to find service by id
            const maybeId = Number(res.service_package);
            if (!isNaN(maybeId) && maybeId > 0) {
              // try to find service by id from the services list (from earlier response)
              const found = sres.data.find(s => Number(s.id) === maybeId);
              if (found) amount = found.price;
            }
          }

          return {
            id: res.id,
            event: res.event_name,
            amount: amount,
            date: res.created_at,
            status: res.status,
          };
        });
        setPayments(rows);
      })
      .catch(() => setPayments([]));
  }, []);

  return (
    <div className="page-card"> 
      <div className="card">
        <table className="events-table">
          <thead>
            <tr><th>Payment ID</th><th>Event</th><th>Amount</th><th>Date</th><th>Time</th><th>Status</th></tr>
          </thead>
          <tbody>
            {payments.map(p => {
              const dt = p.date ? new Date(p.date) : null;
              const dateStr = dt && !isNaN(dt) ? dt.toLocaleDateString() : '—';
              const timeStr = dt && !isNaN(dt) ? dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
              return (
                <tr key={p.id}>
                  <td>#{p.id}</td>
                  <td>{p.event}</td>
                  <td>{p.amount ? `₱${p.amount}` : '—'}</td>
                  <td>{dateStr}</td>
                  <td>{timeStr}</td>
                  <td><span className={`tag ${p.status === 'approved' ? 'confirmed' : 'pending'}`}>{p.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
