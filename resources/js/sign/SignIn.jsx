import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../css/sign/SignIn.css";

export default function SignIn({ onSwitchToSignUp }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Step 1 — Send login request
      const response = await axios.post("http://127.0.0.1:8000/api/login", form);

      const { token, user } = response.data;

      // Step 2 — Save token for future requests
      localStorage.setItem("token", token);
      // set axios default Authorization so subsequent API calls have the header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Notify the app about successful login so global user state can update without reload
      try {
        window.dispatchEvent(new CustomEvent('auth:login', { detail: user }));
      } catch (e) {
        // old browsers may fail to create CustomEvent with constructor
        const ev = document.createEvent('Event');
        ev.initEvent('auth:login', true, true);
        ev.detail = user;
        window.dispatchEvent(ev);
      }

      // Step 3 — SPA navigate based on user role (replace history to avoid stacking)
      if (user.role === "admin") {
        navigate('/admindashboard/home', { replace: true });
      } else {
        navigate('/userdashboard/home', { replace: true });
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid credentials. Please try again.");
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

        <button type="submit">Sign In</button>
      </form>

      <p>
        Don’t have an account?{" "}
        <span className="signup-link" onClick={onSwitchToSignUp}>
            Sign Up
          </span>
      </p>
    </div>
  );
}
