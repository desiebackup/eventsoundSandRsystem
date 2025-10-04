import React from "react";
import "../../css/sign/SignUp.css";

export default function SignUp({ onSwitchToSignIn }) {
  return (
    <div className="signup-container">
      <h2>Create Account</h2>
      <form className="signup-form">
        <input type="firstname" placeholder="First Name" required />
        <input type="lastname" placeholder="Last Name" required />
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Password" required />
        <button type="submit">Sign Up</button>
      </form>

      <div className="signup-footer">
        Already have an account?{" "}
        <span onClick={onSwitchToSignIn}>Sign In</span>
      </div>
    </div>
  );
}
