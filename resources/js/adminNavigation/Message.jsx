// src/components/adminNavigation/Message.jsx
import React, { useState } from "react";
import "../../css/adminnav/Message.css";

export default function Message() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState({
    "John Doe": [
      { sender: "user", text: "Hi, I need help with my reservation." },
      { sender: "admin", text: "Sure, I can assist you with that." },
    ],
    "Jane Smith": [
      { sender: "user", text: "How do I pay for my booking?" },
      { sender: "admin", text: "You can pay via credit card or GCash." },
    ],
  });

  const handleSend = () => {
    if (!selectedUser || message.trim() === "") return;

    const newMsg = { sender: "admin", text: message };
    setMessages((prev) => ({
      ...prev,
      [selectedUser]: [...prev[selectedUser], newMsg],
    }));
    setMessage("");
  };

  return (
    <div className="message-container">
      {/* User List Sidebar */}
      <aside className="user-list">
        <ul>
          {Object.keys(messages).map((user) => (
            <li
              key={user}
              className={selectedUser === user ? "active" : ""}
              onClick={() => setSelectedUser(user)}
            >
              {user}
            </li>
          ))}
        </ul>
      </aside>

      {/* Chat Section */}
      <div className="chat-section">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <h4>{selectedUser}</h4>
            </div>

            <div className="chat-box">
              {messages[selectedUser].map((msg, index) => (
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
