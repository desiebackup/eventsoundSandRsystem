import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../../../css/usernav/dropdown/settings/DeleteAccount.css";

const DeleteAccount = () => {
  const [step, setStep] = useState("warning");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleDeleteClick = () => setStep("confirm");
  const handleCancelDelete = () => setStep("warning");
  const handleConfirmDelete = async () => {
    if (!password.trim()) return;
    const token = localStorage.getItem("token");
    try {
      const res = await axios.delete("http://127.0.0.1:8000/api/user", {
        headers: { Authorization: `Bearer ${token}` },
        data: { password }, // axios DELETE accepts data via config.data
      });

      // Clear client-side auth and navigate to welcome/root
      localStorage.removeItem("token");
      try {
        // allow App to react if it listens for auth:login with null
        window.dispatchEvent(new CustomEvent('auth:login', { detail: null }));
      } catch (e) {
        const ev = document.createEvent('Event');
        ev.initEvent('auth:login', true, true);
        ev.detail = null;
        window.dispatchEvent(ev);
      }

      setStep("success");
    } catch (err) {
      console.error("Account deletion failed:", err);
      const msg = err?.response?.data?.error || err?.response?.data?.message || "Failed to delete account.";
      alert(msg);
      setStep("warning");
    }
  };

  const handleSuccessOk = () => navigate("/");

  return (
    <div className="delete-container">
      <h2>Delete Account</h2>
      <hr />

      {/* STEP 1 — DELETE WARNING */}
      {step === "warning" && (
        <>
          <p className="delete-text">
            Permanently delete your account and all associated data.
          </p>

          <div className="delete-warning-box">
            <strong>Warning:</strong>
            <p>
              Deleting your account will immediately remove all your reservation
              history and details. Please ensure you want to proceed.
            </p>
          </div>

          <button className="delete-btn" onClick={handleDeleteClick}>
            Delete My Account
          </button>
        </>
      )}

      {/* STEP 2 — PASSWORD CONFIRMATION */}
      {step === "confirm" && (
        <div className="confirm-box">
          <h3>Confirm Account Deletion</h3>
          <p className="delete-text">
            To permanently delete your account, please enter your password.
          </p>

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="button-group">
            <button className="btn-cancel" onClick={handleCancelDelete}>
              Cancel
            </button>

            <button
              className="delete-btn"
              onClick={handleConfirmDelete}
              disabled={!password.trim()}
            >
              Confirm Permanent Deletion
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 — SUCCESS MESSAGE */}
      {step === "success" && (
        <div className="success-modal">
          <div className="success-box">
            <h3>Account Deleted</h3>
            <p>Your account has been successfully deleted.</p>
            <button className="ok-btn" onClick={handleSuccessOk}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteAccount;
