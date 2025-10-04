import React from "react";
import "../../css/sign/SignIn.css";
import { auth, provider, signInWithPopup } from "../../firebase";

export default function SignIn({ onSwitchToSignUp }) {

    const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("Signed in as:", user.displayName);
      alert(`Welcome ${user.displayName}!`);
    } catch (error) {
      console.error(error);
      alert("Google sign-in failed. Please try again.");
    }
  };

  return (
    <div className="signin-container">
      <h2>Sign In</h2>
      <form className="signin-form">
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Password" required />
        <button type="submit">Sign In</button>
      </form>

      <button className="google-btn" onClick={handleGoogleSignIn}>
        <img src="/google-icon.png" alt="Google" /> Sign in with Google
      </button>

      <div className="signin-footer">
        Don’t have an account?{" "}
        <span onClick={onSwitchToSignUp}>Sign Up</span>
      </div>
    </div>
  );
}
