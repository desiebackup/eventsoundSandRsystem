// src/components/adminNavigation/Message.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "../../css/adminnav/Message.css";

export default function Message() {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load all conversations safely
  useEffect(() => {
    // We'll fetch all users and also fetch last message info so sidebar shows every user
    const fetchAllUsersAndLastMessages = async () => {
      try {
        const [usersRes, convRes] = await Promise.all([
          axios.get('/api/admin/users'),
          axios.get('/api/admin/conversations'),
        ]);

        const users = Array.isArray(usersRes.data) ? usersRes.data : Array.isArray(usersRes.data?.data) ? usersRes.data.data : [];
        const convs = Array.isArray(convRes.data) ? convRes.data : Array.isArray(convRes.data?.data) ? convRes.data.data : [];

        // Build a map from user_id -> last_message
        const lastMap = {};
        convs.forEach((c) => {
          const uid = c.user?.id ?? c.user_id ?? (c.user && c.user.id);
          if (uid) lastMap[uid] = c.last_message || c.lastMessage || null;
        });

        const merged = users.map((u) => ({
          user: { id: u.id, firstname: u.firstname || '', lastname: u.lastname || '' },
          last_message: lastMap[u.id] || null,
          has_new_from_user: lastMap[u.id] && lastMap[u.id].sender === 'user',
        }));

        setConversations(merged);
      } catch (err) {
        console.error('Error fetching users or conversations:', err);
        setConversations([]);
      }
    };

    fetchAllUsersAndLastMessages();
  }, []);

  // Load messages for selected user
  const selectUser = async (user) => {
    if (!user?.id) return;
    setSelectedUser(user);
    setMessages([]);

    try {
      const res = await axios.get(`/api/admin/messages/${user.id}`);
      const msgs = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.messages)
        ? res.data.messages
        : [];

      setMessages(msgs);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setMessages([]);
    }
  };

  // Send a message
  const handleSend = async () => {
    if (!selectedUser || message.trim() === "") return;

    const newMsg = {
      sender: "admin",
      text: message.trim(),
      created_at: new Date().toISOString(),
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, newMsg]);
    setMessage("");

    try {
      await axios.post("/api/admin/messages", {
        user_id: selectedUser.id,
        text: message.trim(),
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Failed to send message");
    }
  };

  // Enter key send
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="admin-chat-container">
      {/* Sidebar - User Conversations */}
      <aside className="admin-chat-sidebar">
        <ul className="admin-chat-userlist">
          {conversations.length > 0 ? (
            conversations.map((c) => (
              <li
                key={c.user.id}
                className={`admin-chat-user ${selectedUser && selectedUser.id === c.user.id ? 'active' : ''} ${c.has_new_from_user && !(selectedUser && selectedUser.id === c.user.id) ? 'has-new' : ''}`}
                onClick={() => {
                  // clear the 'new' marker when selecting
                  setConversations((prev) => prev.map((p) => p.user.id === c.user.id ? { ...p, has_new_from_user: false } : p));
                  selectUser(c.user);
                }}
              >
                <span className="user-name">{`${c.user.firstname} ${c.user.lastname}`}</span>
                {c.has_new_from_user && <strong className="new-indicator"> •</strong>}
              </li>
            ))
          ) : (
            <li className="admin-chat-user empty">No users found</li>
          )}
        </ul>
      </aside>

      {/* Main Chat Section */}
      <div className="admin-chat-main">
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="admin-chat-header">
              <h4>
                {selectedUser.firstname} {selectedUser.lastname}
              </h4>
            </div>

            {/* Messages */}
            <div className="admin-chat-messages">
              {messages.length > 0 ? (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`admin-chat-bubble ${
                      msg.sender === "admin"
                        ? "admin-sent"
                        : "admin-received"
                    }`}
                  >
                    {msg.text}
                  </div>
                ))
              ) : (
                <div className="admin-chat-empty-msg">
                  <p>No messages yet.</p>
                </div>
              )}
              <div ref={messagesEndRef}></div>
            </div>

            {/* Input */}
            <div className="admin-chat-input">
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button onClick={handleSend}>Send</button>
            </div>
          </>
        ) : (
          <div className="admin-chat-empty">
            <p>Select a user to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
