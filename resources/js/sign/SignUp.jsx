import React, { useState } from "react";
import axios from "axios";
import logo from "../../img/logo.png";
import "../../css/sign/SignUp.css";

export default function SignUp({ onSwitchToSignIn }) {
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // realtime validation messages
  const passwordTooShort = form.password && form.password.length > 0 && form.password.length < 8;
  const passwordsMismatch = form.password_confirmation && form.password !== form.password_confirmation;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    // Client-side validation: enforce minimum password length and matching confirmation
    if (!form.password || form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (form.password !== form.password_confirmation) {
      setError("Password and confirmation do not match.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/register",
        form
      );

      if (response.status === 201) {
        setSuccess("Registration successful! You can now sign in.");
        setTimeout(onSwitchToSignIn, 1500);
      }
    } catch (err) {
      if (err.response && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    }
  };

  return (
    <div className="signup-container">
      <img src={logo} alt="Event Sound Pro Logo" className="signup-logo" />
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="firstname"
          placeholder="First Name"
          value={form.firstname}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="lastname"
          placeholder="Last Name"
          value={form.lastname}
          onChange={handleChange}
          required
        />
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
          placeholder="Password (min 8 characters)"
          value={form.password}
          onChange={handleChange}
          required
          minLength={8}
        />
        {passwordTooShort && (
          <p className="error" aria-live="polite">Password should contain at least 8 characters.</p>
        )}
        <input
          type="password"
          name="password_confirmation"
          placeholder="Confirm Password"
          value={form.password_confirmation}
          onChange={handleChange}
          required
        />
        {passwordsMismatch && (
          <p className="error" aria-live="polite">Passwords do not match.</p>
        )}
        <button type="submit" disabled={form.password.length < 8 || form.password !== form.password_confirmation}>
          Register
        </button>
      </form>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <p>
        Already have an account?{" "}
        <span className="link-btn" onClick={onSwitchToSignIn}>
    Sign In
  </span>
      </p>
    </div>
  );
}
