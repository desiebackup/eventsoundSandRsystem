import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "../../../../css/usernav/dropdown/settings/Profile.css";
import avatarDefault from "../../../../img/avatar.png";

export default function Profile() {
  const base = "http://127.0.0.1:8000";
  const token = localStorage.getItem("token");

  const [initialUser, setInitialUser] = useState(null);
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
  const [isImageOpen, setIsImageOpen] = useState(false); // ✅ added this line

  const objectUrlRef = useRef(null);

  useEffect(() => {
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

        setPreviewImage(u.avatar ? `${base}/storage/${u.avatar}` : avatarDefault);
      } catch (err) {
        console.error(err);
        setError("Unable to load user data. Please sign in again.");
      }
    };

    fetchUser();

    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, [token]);

  const handleEditClick = () => {
    setMessage("");
    setError("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (initialUser) {
      setUser({
        firstname: initialUser.firstname,
        lastname: initialUser.lastname,
        email: initialUser.email,
        avatar: initialUser.avatar,
      });
      setPreviewImage(
        initialUser.avatar ? `${base}/storage/${initialUser.avatar}` : avatarDefault
      );
    }

    setSelectedImage(null);
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setIsEditing(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedImage(file);

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;

    setPreviewImage(url);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("firstname", user.firstname);
      formData.append("lastname", user.lastname);
      formData.append("email", user.email);

      if (selectedImage) formData.append("avatar", selectedImage);

      const res = await axios.post(`${base}/api/profile/update`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedUser = res.data.user || res.data;

      setInitialUser(updatedUser);
      setUser(updatedUser);
      setPreviewImage(
        updatedUser.avatar ? `${base}/storage/${updatedUser.avatar}` : avatarDefault
      );

      setSelectedImage(null);
      setIsEditing(false);
      setMessage("Profile updated successfully.");
      // Notify the app that the authenticated user data changed so global UI can update
      try {
        window.dispatchEvent(new CustomEvent('auth:login', { detail: updatedUser }));
      } catch (e) {
        // fallback for older browsers
        const ev = document.createEvent('Event');
        ev.initEvent('auth:login', true, true);
        ev.detail = updatedUser;
        window.dispatchEvent(ev);
      }
    } catch (err) {
      console.error(err);
      let serverMsg = "Failed to update profile.";
      if (err?.response?.data?.errors) {
        serverMsg = Object.values(err.response.data.errors).flat().join(" ");
      }
      setError(serverMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-wrapper">
      <div className="profile-header">
        <h2>Profile Information</h2>
      </div>
      <hr />

      <div className="profile-description">
        Keep your profile updated by managing your information.
      </div>

      <div className="profile-card">
        <form onSubmit={handleSave} className="profile-form">
          <h3>Personal Details</h3>
          

          <div className="profile-picture-box">
            {/* ✅ Clickable profile image */}
            <div className="avatar-circle" onClick={() => setIsImageOpen(true)}>
              {previewImage ? (
                <img src={previewImage} alt="Avatar" />
              ) : (
                <span>
                  {user.firstname?.charAt(0)}
                  {user.lastname?.charAt(0)}
                </span>
              )}
            </div>

            {isEditing && (
              <label className="upload-btn">
                Change Profile Picture
                <input type="file" accept="image/*" onChange={handleImageChange} />
              </label>
            )}
          </div>

          <div className="input-grid">
            <div className="input-group">
              <label>First Name</label>
              <input
                type="text"
                value={user.firstname}
                disabled={!isEditing}
                onChange={(e) => setUser({ ...user, firstname: e.target.value })}
                required
              />
            </div>

            <div className="input-group">
              <label>Last Name</label>
              <input
                type="text"
                value={user.lastname}
                disabled={!isEditing}
                onChange={(e) => setUser({ ...user, lastname: e.target.value })}
                required
              />
            </div>

            <div className="input-group full">
              <label>Email Address</label>
              <input
                type="email"
                value={user.email}
                disabled={!isEditing}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="button-row">
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

                <button type="submit" className="btn btn-save" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
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

        {isImageOpen && (
          <div className="image-modal" onClick={() => setIsImageOpen(false)}>
            <div
              className="image-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="close-btn"
                onClick={() => setIsImageOpen(false)}
                type="button"
              >
                &times;
              </button>
              <img src={previewImage} alt="Full Avatar" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
