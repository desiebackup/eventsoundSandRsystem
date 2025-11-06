import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { FaPaperPlane, FaComments, FaTimes } from "react-icons/fa";
import defaultAvatar from "../../../img/avatar.png";
import "../../../css/usernav/dropdown/ChatUs.css";

const ChatUs = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [defaultReplied, setDefaultReplied] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false); 
  const [profileData, setProfileData] = useState({ avatar: defaultAvatar, name: "Admin" }); 
  const messagesEndRef = useRef(null);

  // Scroll to bottom on open or message update
  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Send user message
  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "You", avatar: null, type: "user" };
    setMessages((prev) => [...prev, userMessage]);
    const textToSend = input;
    setInput("");

    // Persist to server
    axios
      .post("/api/messages", { text: textToSend })
      .then((res) => {
        // message saved; admin may reply later
      })
      .catch((e) => {
        console.error("Failed to send message", e);
      });

    if (!defaultReplied) {
      const instantReply = { text: "Welcome to Event Sound Pro! Thank you for visiting. If you have any questions, concerns, or need assistance, an admin will be with you shortly. We specialize in providing high-quality event sound services and support.", 
        sender: "Admin", avatar: defaultAvatar, type: "admin" };
      setMessages((prev) => [...prev, instantReply]);
      setDefaultReplied(true);
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleSend(); };

  // Function to append actual admin reply
  const addAdminReply = (adminData) => {
    const adminMessage = {
      text: adminData.text,
      sender: `${adminData.firstName} ${adminData.lastName}`,
      avatar: adminData.avatarUrl,
      type: "admin",
    };
    setMessages((prev) => [...prev, adminMessage]);
  };

  // Poll for admin replies periodically when chat is open
  useEffect(() => {
    let timer = null;
    const fetchMessages = () => {
      axios
        .get("/api/messages")
        .then((res) => {
          // server returns array of messages for this user
          const serverMsgs = res.data || [];
          // Map to local message shape and replace local messages with server messages + keep instant reply
          const mapped = serverMsgs.map((m) => ({ text: m.text, sender: m.sender === 'admin' ? (m.sender_name || 'Admin') : 'You', avatar: m.sender === 'admin' ? defaultAvatar : null, type: m.sender }));
          // If default instant reply was set earlier, preserve earlier admin intro
          setMessages((prev) => {
            const intro = prev.find((p) => p.type === 'admin' && p.text && p.text.includes('Welcome to Event Sound Pro'));
            const combined = mapped.length ? mapped : prev;
            if (intro && !combined.find((c) => c.text === intro.text)) combined.unshift(intro);
            return combined;
          });
        })
        .catch(() => {});
    };

    if (isOpen) {
      fetchMessages();
      timer = setInterval(fetchMessages, 5000);
    }

    return () => clearInterval(timer);
  }, [isOpen]);

  const lastAdmin = messages.filter((msg) => msg.type === "admin").slice(-1)[0] || { sender: "Admin", avatar: defaultAvatar };

  return (
    <div className="chat-container">
      {/* Chat toggle button */}
      {!isOpen && (
        <button className="chat-toggle-btn" onClick={() => setIsOpen(true)} title="Chat with Us">
          <FaComments size={40} />
        </button>
      )}

      {isOpen && (
        <div className="chat-window">
          {/* Chat header */}
          <div className="chat-header">
            <img
              src={lastAdmin.avatar}
              alt={lastAdmin.sender}
              className="chat-avatar clickable"
              onClick={() => {
                setProfileData({ avatar: lastAdmin.avatar, name: lastAdmin.sender });
                setIsProfileOpen(true);
              }}
            />
            <h3>{lastAdmin.sender}</h3>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              <FaTimes size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.type}`}>
                {msg.avatar && msg.type === "admin" && (
                  <img
                    src={msg.avatar}
                    alt={msg.sender}
                    className="chat-avatar clickable"
                    onClick={() => {
                      setProfileData({ avatar: msg.avatar, name: msg.sender });
                      setIsProfileOpen(true);
                    }}
                  />
                )}
                <div className="message-text">{msg.text}</div>
              </div>
            ))}
            <div ref={messagesEndRef}></div>
          </div>

          {/* Input */}
          <div className="chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
            />
            <button className="send-btn" onClick={handleSend}>
              <FaPaperPlane size={18} />
            </button>
          </div>

          {/* Admin Profile Modal */}
          {isProfileOpen && (
            <div className="profile-modal">
              <div className="profile-content">
                <button className="modal-close" onClick={() => setIsProfileOpen(false)}>
                  <FaTimes size={18} />
                </button>
                <img src={profileData.avatar} alt={`${profileData.name} Profile`} className="profile-avatar" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatUs;