import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../css/sign/SignIn.css";

export default function SignIn({ onSwitchToSignUp }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");

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
      setError("Invalid credentials. Please try again.");
    }
  };

  // === Handle Forgot Password Request ===
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotMessage("");
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/forgot-password", {
        email: forgotEmail,
      });
      setForgotMessage(
        "Password reset link has been sent to your email address."
      );
      setForgotEmail("");
    } catch (err) {
      console.error("Forgot password error:", err);
      setForgotMessage(
        "Unable to send password reset link. Please check your email."
      );
    }
  };

  return (
    <div className="signin-container">
      <h2>Sign In</h2>

      {error && <p className="error">{error}</p>}

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
                  className="btn-cancel"
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

            {forgotMessage && <p className="forgot-message">{forgotMessage}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
