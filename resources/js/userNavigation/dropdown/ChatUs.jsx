import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { FaPaperPlane, FaComments, FaTimes } from "react-icons/fa";
import userAvatar from "../../../img/avatar.png"; // user avatar
import adminAvatar from "../../../img/admin-avatar.png"; // admin avatar
import "../../../css/usernav/dropdown/ChatUs.css";

const ChatUs = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    avatar: adminAvatar,
    name: "Admin",
  });
  const messagesEndRef = useRef(null);

  // Scroll to bottom when chat opens or messages update
  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Send user message (optimistic add)
  const handleSend = async () => {
    if (!input.trim()) return;

    const textToSend = input.trim();

    // Add immediately to UI
    const userMessage = { text: textToSend, sender: "You", type: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      await axios.post("/api/messages", { text: textToSend });
    } catch (e) {
      console.error("Failed to send message", e);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  // Fetch messages every 5 seconds when open
  useEffect(() => {
    let timer = null;

    const fetchMessages = async () => {
      try {
        const res = await axios.get("/api/messages");
        const serverMsgs = res.data || [];

        const mapped = serverMsgs.map((m) => ({
          text: m.text,
          sender: m.sender === "admin" ? m.sender_name || "Admin" : "You",
          avatar: m.sender === "admin" ? adminAvatar : null,
          type: m.sender,
        }));

        setMessages(mapped);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    if (isOpen) {
      fetchMessages();
      timer = setInterval(fetchMessages, 5000);
    }

    return () => clearInterval(timer);
  }, [isOpen]);

  // Determine last admin message for header display
  const lastAdmin =
    messages.filter((msg) => msg.type === "admin").slice(-1)[0] || {
      sender: "Admin",
      avatar: adminAvatar,
    };

  return (
    <div className="chat-container">
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          className="chat-toggle-btn"
          onClick={() => setIsOpen(true)}
          title="Chat with Us"
        >
          <FaComments size={40} />
        </button>
      )}

      {isOpen && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <img
              src={lastAdmin.avatar}
              alt={lastAdmin.sender}
              className="chat-avatar clickable"
              onClick={() => {
                setProfileData({
                  avatar: lastAdmin.avatar,
                  name: lastAdmin.sender,
                });
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
                      setProfileData({
                        avatar: msg.avatar,
                        name: msg.sender,
                      });
                      setIsProfileOpen(true);
                    }}
                  />
                )}
                <div className="message-text">{msg.text}</div>
              </div>
            ))}
            <div ref={messagesEndRef}></div>
          </div>

          {/* Input Area */}
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

          {/* Profile Modal */}
          {isProfileOpen && (
            <div className="profile-modal">
              <div className="profile-content">
                <button
                  className="modal-close"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <FaTimes size={18} />
                </button>
                <img
                  src={profileData.avatar}
                  alt={`${profileData.name} Profile`}
                  className="profile-avatar"
                />
                <h4>{profileData.name}</h4>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatUs;
