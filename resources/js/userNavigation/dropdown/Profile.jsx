// resources/js/userNavigation/dropdown/Profile.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "../../../css/usernav/dropdown/Profile.css";
import avatarDefault from "../../../img/avatar.png";

export default function Profile() {
  const base = "http://127.0.0.1:8000"; // update if your API host is different
  const token = localStorage.getItem("token");
  const [initialUser, setInitialUser] = useState(null); // original fetched user
  const [user, setUser] = useState({
    firstname: "",
    lastname: "",
    email: "",
    avatar: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(avatarDefault);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const objectUrlRef = useRef(null);

  useEffect(() => {
    // fetch user on mount
    const fetchUser = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${base}/api/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const u = res.data;
        setInitialUser(u);
        setUser({
          firstname: u.firstname || "",
          lastname: u.lastname || "",
          email: u.email || "",
          avatar: u.avatar || "",
        });
        if (u.avatar) {
          setPreviewImage(`${base}/storage/${u.avatar}`);
        } else {
          setPreviewImage(avatarDefault);
        }
      } catch (err) {
        console.error("Error loading user data:", err);
        setError("Unable to load user data. Please sign in again.");
      }
    };

    fetchUser();

    // cleanup object URLs on unmount
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, [token]);

  const handleEditClick = () => {
    setMessage("");
    setError("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    // revert to initial
    if (initialUser) {
      setUser({
        firstname: initialUser.firstname || "",
        lastname: initialUser.lastname || "",
        email: initialUser.email || "",
        avatar: initialUser.avatar || "",
      });
      if (initialUser.avatar) {
        setPreviewImage(`${base}/storage/${initialUser.avatar}`);
      } else {
        setPreviewImage(avatarDefault);
      }
    }
    setSelectedImage(null);
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setNewPassword("");
    setConfirmPassword("");
    setIsEditing(false);
    setMessage("");
    setError("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedImage(file);
    // create object URL for preview
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    const objUrl = URL.createObjectURL(file);
    objectUrlRef.current = objUrl;
    setPreviewImage(objUrl);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    // basic client side validation for password
    if (newPassword && newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("firstname", user.firstname);
      formData.append("lastname", user.lastname);
      formData.append("email", user.email);

      if (selectedImage) {
        formData.append("avatar", selectedImage);
      }

      if (newPassword) {
        // backend should handle password confirmation/validation
        formData.append("password", newPassword);
        formData.append("password_confirmation", confirmPassword);
      }

      const res = await axios.post(`${base}/api/profile/update`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // assume response returns updated user object in res.data.user or res.data
      const updatedUser = res.data.user || res.data;
      setInitialUser(updatedUser);
      setUser({
        firstname: updatedUser.firstname || "",
        lastname: updatedUser.lastname || "",
        email: updatedUser.email || "",
        avatar: updatedUser.avatar || "",
      });

      if (updatedUser.avatar) {
        setPreviewImage(`${base}/storage/${updatedUser.avatar}`);
      } else {
        setPreviewImage(avatarDefault);
      }

      setSelectedImage(null);
      setNewPassword("");
      setConfirmPassword("");
      setIsEditing(false);
      setMessage("Profile updated successfully.");
    } catch (err) {
      console.error("Error updating profile:", err);
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to update profile. Please try again.";
      setError(serverMsg);
    } finally {
      setSaving(false);
    }
  };

  // show loading / not loaded state
  if (!initialUser && !error) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <p>Loading profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2 className="profile-title">My Profile</h2>


        <div className="profile-avatar-section">
          <img
            src={previewImage}
            alt="User Avatar"
            className="profile-avatar"
          />

          {isEditing ? (
            <>
              <label className="avatar-upload-btn">
                Change Profile Picture
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </label>
            </>
          ) : null}
        </div>

        <form onSubmit={handleSave} className="profile-form">
          <div className="form-row">
            <label>First Name</label>
            <input
              type="text"
              value={user.firstname}
              disabled={!isEditing}
              onChange={(e) => setUser({ ...user, firstname: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <label>Last Name</label>
            <input
              type="text"
              value={user.lastname}
              disabled={!isEditing}
              onChange={(e) => setUser({ ...user, lastname: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <label>Email</label>
            <input
              type="email"
              value={user.email}
              disabled={!isEditing}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              required
            />
          </div>

          {isEditing && (
            <>
              <div className="form-row">
                <label>New Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  placeholder="Leave empty to keep current password"
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="form-row">
                <label>Confirm New Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <div className="show-password-row">
                <input
                  id="showPassword"
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                />
                <label htmlFor="showPassword">Show password</label>
              </div>
            </>
          )}

          <div className="form-actions">
            {isEditing ? (
              <>
                <button
                  type="button"
                  className="btn btn-cancel"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-save"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleEditClick}
              >
                Edit Profile
              </button>
            )}
          </div>

          {message && <div className="msg success">{message}</div>}
          {error && <div className="msg error">{error}</div>}
        </form>
      </div>
    </div>
  );
}
