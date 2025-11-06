import React, { useState, useEffect } from "react";
import { FaSun, FaMoon } from "react-icons/fa";
import "../../../../css/usernav/dropdown/settings/Appearance.css";

const Appearance = () => {
  const [theme, setTheme] = useState("light");

  // Load the saved theme when component mounts
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div className="content-box">
      <h2>Appearance Preference</h2>
      <hr />
      <p>Adjust your visual theme of the application to match your preference.</p>

      <div className="theme-box">
        <h2>Select Your Mode</h2>

        <div className="theme-options">
          <button
            className={`theme-btn ${theme === "light" ? "active" : ""}`}
            onClick={() => handleThemeChange("light")}
          >
            <FaSun
              className="icon"
              style={{
                color: theme === "light" ? "var(--accent)" : "var(--text-color)",
              }}
            />
            Light
          </button>

          <button
            className={`theme-btn ${theme === "dark" ? "active" : ""}`}
            onClick={() => handleThemeChange("dark")}
          >
            <FaMoon
              className="icon"
              style={{
                color: theme === "dark" ? "var(--accent)" : "var(--text-color)",
              }}
            />
            Dark
          </button>
        </div>
      </div>
    </div>
  );
};

export default Appearance;