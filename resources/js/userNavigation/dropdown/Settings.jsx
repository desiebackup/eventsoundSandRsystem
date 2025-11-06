import { useState } from "react";
import Profile from "./settings/Profile";
import Appearance from "./settings/Appearance";
import SecurityPrivacy from "./settings/SecurityPrivacy";
import DeleteAccount from "./settings/DeleteAccount";
import "../../../css/usernav/dropdown/Settings.css";

export default function Settings() {
  const [section, setSection] = useState("profile");

  return (
    <div className="settings-wrapper">
      <div className="settings-card">
        <h2>Account Settings</h2>
        <hr />

        <div className="settings-menu">
          <button
            className={section === "profile" ? "active" : ""}
            onClick={() => setSection("profile")}
          >
            Profile Information
          </button>

          <button
            className={section === "appearance" ? "active" : ""}
            onClick={() => setSection("appearance")}
          >
            Appearance Preference
          </button>

          <button
            className={section === "security" ? "active" : ""}
            onClick={() => setSection("security")}
          >
            Security and Privacy
          </button>

          <button
            className={section === "delete" ? "active" : ""}
            onClick={() => setSection("delete")}
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="settings-content">
        {section === "profile" && <Profile />}
        {section === "appearance" && <Appearance />}
        {section === "security" && <SecurityPrivacy />}
        {section === "delete" && <DeleteAccount />}
      </div>
    </div>
  );
}