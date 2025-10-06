import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../firebase";
import "../../css/sign/SignUp.css";

export default function SignUp({ onSwitchToSignIn }) {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Simple password confirmation check
    if (formData.password !== formData.password_confirmation) {
      setError("Passwords do not match.");
      return;
    }

    try {
      // Create user with email & password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Update Firebase profile with firstname and lastname
      await updateProfile(userCredential.user, {
        displayName: `${formData.firstname} ${formData.lastname}`,
      });

      // User is now signed in → App.jsx listener shows UserDashboard
    } catch (err) {
      console.error(err.message);
      setError("Signup failed: " + err.message);
    }
  };

  return (
    <div className="signup-container">
      <h2>Create Account</h2>
      <form className="signup-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="firstname"
          placeholder="First Name"
          value={formData.firstname}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="lastname"
          placeholder="Last Name"
          value={formData.lastname}
          onChange={handleChange}
          required
        />
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
        <input
          type="password"
          name="password_confirmation"
          placeholder="Confirm Password"
          value={formData.password_confirmation}
          onChange={handleChange}
          required
        />
        <button type="submit">Sign Up</button>
      </form>

      {error && <p className="error">{error}</p>}

      <div className="signup-footer">
        Already have an account?{" "}
        <span onClick={onSwitchToSignIn}>Sign In</span>
      </div>
    </div>
  );
}
