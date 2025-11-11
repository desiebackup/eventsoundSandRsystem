import React, { useState } from "react";
import axios from "axios";
import logo from "../../img/logo.png";
import { useNavigate } from "react-router-dom";
import "../../css/sign/SignIn.css";

export default function SignIn({ onSwitchToSignUp }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login", form);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Fire login event for global auth state
      try {
        window.dispatchEvent(new CustomEvent("auth:login", { detail: user }));
      } catch (e) {
        const ev = document.createEvent("Event");
        ev.initEvent("auth:login", true, true);
        ev.detail = user;
        window.dispatchEvent(ev);
      }

      // Redirect based on role
      if (user.role === "admin") {
        navigate("/admindashboard/home", { replace: true });
      } else {
        navigate("/userdashboard/home", { replace: true });
      }
    } catch (err) {
      console.error("Login failed:", err);
      // Prefer server-provided message when available
      const serverMsg = err?.response?.data?.message || err?.message || "Invalid credentials. Please try again.";
      setError(serverMsg);
    }
  };

  // === Handle Forgot Password Request ===
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotMessage("");
    setForgotError(false);
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/forgot-password", {
        email: forgotEmail,
      });
      // Prefer server-returned message
      setForgotMessage(res?.data?.message || "Password reset link has been sent to your email address.");
      setForgotError(false);
      setForgotEmail("");
    } catch (err) {
      console.error("Forgot password error:", err);
      const serverMsg = err?.response?.data?.message || err?.message || "Unable to send password reset link. Please check your email.";
      setForgotMessage(serverMsg);
      setForgotError(true);
    }
  };

  return (
    <div className="signin-container">
      <img src={logo} alt="Event Sound Pro Logo" className="signin-logo" />

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <div className="forgot-password-wrapper">
          <span
            className="forgot-password-link"
            onClick={() => setShowForgot(true)}
          >
            Forgot Password?
          </span>
        </div>

        <button type="submit">Sign In</button>
      </form>
      {/* Show error message below the form but above the signup link so users can correct credentials */}
      {error && <p className="error">{error}</p>}

      <p>
        Don’t have an account?{" "}
        <span className="signup-link" onClick={onSwitchToSignUp}>
          Sign Up
        </span>
      </p>

      {/* === Forgot Password Modal === */}
      {showForgot && (
        <div className="forgot-modal">
          <div className="forgot-card">
            <h3>Reset Password</h3>
            <p>Enter your email and we’ll send you a password reset link.</p>

            <form onSubmit={handleForgotSubmit}>
              <input
                type="email"
                placeholder="Your Email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
              <div className="forgot-buttons">
                <button type="submit" className="btn-send-link">
                  Send Link
                </button>
                <button
                  type="button"
                  className="button-cancel"
                  onClick={() => {
                    setShowForgot(false);
                    setForgotMessage("");
                    setForgotEmail("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>

            {forgotMessage && (
              <p className={`forgot-message ${forgotError ? 'error' : 'success'}`}>
                {forgotMessage}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
