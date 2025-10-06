import React from "react";
import "../../css/sign/SignIn.css";

export default function SignIn({ onSwitchToSignUp }) {


  return (
    <div className="signin-container">
      <h2>Sign In</h2>
      <form className="signin-form">
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Password" required />
        <button type="submit">Sign In</button>
      </form>

      <div className="signin-footer">
        Don’t have an account?{" "}
        <span onClick={onSwitchToSignUp}>Sign Up</span>
      </div>
    </div>
  );
}
