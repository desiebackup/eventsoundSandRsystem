// src/components/adminNavigation/Message.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/adminnav/Message.css";

export default function Message() {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // load conversations
    axios
      .get('/api/admin/conversations')
      .then((res) => setConversations(res.data))
      .catch(() => setConversations([]));
  }, []);

  const handleSend = async () => {
    if (!selectedUser || message.trim() === "") return;
    try {
      const res = await axios.post('/api/admin/messages', { user_id: selectedUser.id, text: message });
      setMessages((prev) => [...prev, res.data]);
      setMessage('');
    } catch (e) {
      console.error(e);
      alert('Failed to send');
    }
  };

  const selectUser = async (u) => {
    setSelectedUser(u);
    try {
      const res = await axios.get(`/api/admin/messages/${u.id}`);
      setMessages(res.data || []);
    } catch (e) {
      console.error(e);
      setMessages([]);
    }
  };

  return (
    <div className="message-container">
      {/* User List Sidebar */}
      <aside className="user-list">
        <ul>
          {conversations.map((c) => (
            <li
              key={c.user?.id}
              className={selectedUser && selectedUser.id === c.user?.id ? "active" : ""}
              onClick={() => selectUser(c.user)}
            >
              {c.user ? `${c.user.firstname} ${c.user.lastname}` : 'Unknown'}
            </li>
          ))}
        </ul>
      </aside>

      {/* Chat Section */}
      <div className="chat-section">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <h4>{selectedUser.firstname} {selectedUser.lastname}</h4>
            </div>

            <div className="chat-box">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`chat-message ${msg.sender === "admin" ? "sent" : "received"}`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            <div className="chat-input">
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button onClick={handleSend}>Send</button>
            </div>
          </>
        ) : (
          <div className="no-chat">Select a user to start chatting</div>
        )}
      </div>
    </div>
  );
}
