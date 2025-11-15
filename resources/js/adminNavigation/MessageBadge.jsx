import React, { useEffect, useState } from "react";
import axios from "axios";

export default function MessageBadge() {
  const [count, setCount] = useState(0);

  const fetchCount = async () => {
    try {
      const res = await axios.get('/api/admin/conversations');
      const convs = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];
      // Count conversations where last_message.sender === 'user' (unread from user)
      let c = 0;
      convs.forEach((cv) => {
        const last = cv.last_message || cv.lastMessage || null;
        if (last && String(last.sender).toLowerCase() === 'user') c++;
      });
      setCount(c);
    } catch (err) {
      // ignore failures silently
      // console.error('Failed to fetch message count', err);
    }
  };

  useEffect(() => {
    fetchCount();
    const t = setInterval(fetchCount, 5000);
    return () => clearInterval(t);
  }, []);

  if (!count || count <= 0) return null;

  return (
    <div className="nav-message-badge">
      <div className="message-count">{count} new {count === 1 ? 'message' : 'messages'}</div>
    </div>
  );
}
