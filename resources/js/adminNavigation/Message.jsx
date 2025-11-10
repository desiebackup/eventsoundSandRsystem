// src/components/adminNavigation/Message.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import defaultAvatar from "../../img/avatar.png";
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
          user: {
            id: u.id,
            firstname: u.firstname || u.first_name || '',
            lastname: u.lastname || u.last_name || '',
            // try common avatar fields
            avatar: u.avatar ?? u.image ?? u.image_url ?? u.photo ?? null,
          },
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

  // Listen for profile updates so avatar/name changes reflect immediately in this component
  useEffect(() => {
    const handleProfileUpdated = (e) => {
      const detail = e?.detail || {};
      const id = detail.id ?? detail.user_id ?? detail.user?.id;
      if (!id) return;

      // Debug: log incoming profile update detail (helps when avatar doesn't update)
      try {
        console.debug('[Message] profileUpdated event received for id=', id, 'detail=', detail);
      } catch (err) {}

      // Update conversations list avatars/names (coerce id to string to avoid type mismatches)
      setConversations((prev) =>
        prev.map((c) => {
          if (String(c.user.id) === String(id)) {
            return {
              ...c,
              user: {
                ...c.user,
                avatar: detail.avatar ?? detail.image_url ?? detail.image ?? c.user.avatar,
                firstname: detail.firstname ?? detail.first_name ?? c.user.firstname,
                lastname: detail.lastname ?? detail.last_name ?? c.user.lastname,
              },
            };
          }
          return c;
        })
      );

      // Update selectedUser if it matches
      setSelectedUser((prev) => {
        if (!prev || String(prev.id) !== String(id)) return prev;
        return {
          ...prev,
          avatar: detail.avatar ?? detail.image_url ?? detail.image ?? prev.avatar,
          firstname: detail.firstname ?? detail.first_name ?? prev.firstname,
          lastname: detail.lastname ?? detail.last_name ?? prev.lastname,
        };
      });
    };

    window.addEventListener('profileUpdated', handleProfileUpdated);
    // also listen for auth:login which some components dispatch on profile changes
    window.addEventListener('auth:login', handleProfileUpdated);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdated);
      window.removeEventListener('auth:login', handleProfileUpdated);
    };
  }, []);

  // Small Avatar helper: normalizes various avatar shapes (full URL, storage path, or bare filename)
  const Avatar = ({ avatar, firstname, lastname, className, placeholderClass }) => {
    const [broken, setBroken] = useState(false);

    // Reset broken state when avatar prop changes so a previously-broken image
    // will attempt to load the new avatar value.
    useEffect(() => {
      setBroken(false);
    }, [avatar]);

    const initials = `${(firstname || "").charAt(0) || ""}${(lastname || "").charAt(0) || ""}`.toUpperCase();

    // If there's no avatar stored, show the app's default avatar image (same as Userdashboard)
    if (!avatar && !broken) {
      return <img className={className} src={defaultAvatar} alt={`${firstname || ''} ${lastname || ''}`.trim()} />;
    }

    // normalize avatar string
    let src = avatar;
    try {
      if (!src) {
        // fallback to default image
        src = avatar;
      } else if (!/^https?:\/\//i.test(src)) {
        if (src.indexOf('/storage/') === -1) {
          // add a cache-busting query when composing from a bare filename so updated uploads
          // replace any cached image in the admin UI immediately
          src = `http://127.0.0.1:8000/storage/${src.replace(/^\//, '')}?t=${Date.now()}`;
        }
      }
    } catch (e) {
      // fall through
    }

    // If still no valid src or the image previously failed, show default avatar image
    if (!src || broken) {
      return <img className={className} src={defaultAvatar} alt={`${firstname || ''} ${lastname || ''}`.trim()} onError={() => setBroken(true)} />;
    }

    return (
      <img
        className={className}
        src={src}
        alt={`${firstname || ''} ${lastname || ''}`.trim()}
        onError={() => setBroken(true)}
      />
    );
  };

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
            conversations.map((c) => {
              const fullName = `${c.user.firstname} ${c.user.lastname}`.trim();
              const initials = `${(c.user.firstname || '').charAt(0) || ''}${(c.user.lastname || '').charAt(0) || ''}`.toUpperCase();
              return (
                <li
                  key={c.user.id}
                  className={`admin-chat-user ${selectedUser && selectedUser.id === c.user.id ? 'active' : ''} ${c.has_new_from_user && !(selectedUser && selectedUser.id === c.user.id) ? 'has-new' : ''}`}
                  onClick={() => {
                    // clear the 'new' marker when selecting
                    setConversations((prev) => prev.map((p) => p.user.id === c.user.id ? { ...p, has_new_from_user: false } : p));
                    selectUser(c.user);
                  }}
                >
                  <div className="user-left">
                    <Avatar
                      avatar={c.user.avatar}
                      firstname={c.user.firstname}
                      lastname={c.user.lastname}
                      className="user-avatar"
                      placeholderClass="avatar-placeholder"
                    />
                    <span className="user-name">{fullName || 'User'}</span>
                  </div>
                  {c.has_new_from_user && <strong className="new-indicator"> •</strong>}
                </li>
              );
            })
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
              <div className="header-left">
                <Avatar
                  avatar={selectedUser.avatar}
                  firstname={selectedUser.firstname}
                  lastname={selectedUser.lastname}
                  className="header-avatar"
                  placeholderClass="header-avatar placeholder"
                />
                <h4>
                  {selectedUser.firstname} {selectedUser.lastname}
                </h4>
              </div>
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
