import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import "../../css/sign/SignIn.css";

export default function SignIn({ onSwitchToSignUp }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Sign in with Firebase
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      // App.jsx listener automatically shows UserDashboard
    } catch (err) {
      console.error(err.message);
      setError("Login failed: " + err.message);
    }
  };

  return (
    <div className="signin-container">
      <h2>Sign In</h2>
      <form className="signin-form" onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Sign In</button>
      </form>
      {error && <p className="error">{error}</p>}
      <div className="signin-footer">
        Don't have an account?{" "}
        <span onClick={onSwitchToSignUp}>Sign Up</span>
      </div>
    </div>
  );
}
