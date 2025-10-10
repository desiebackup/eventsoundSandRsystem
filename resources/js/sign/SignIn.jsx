import React, { useState } from "react";
import axios from "axios";
import "../../css/sign/SignIn.css";

export default function SignIn({ onSwitchToSignUp }) {
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

      // Step 3 — Redirect based on user role
      if (user.role === "admin") {
        window.location.href = "/admindashboard";
      } else {
        window.location.href = "/userdashboard/home";
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
