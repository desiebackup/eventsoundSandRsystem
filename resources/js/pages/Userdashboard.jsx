import React, { useState } from "react";
import Dashboard from "../userNavigation/Dashboard";
import SoundPackage from "../userNavigation/SoundPackage";
import PaymentHistory from "../userNavigation/Paymenthistory";
import TermsAndCondition from "../userNavigation/Termsandcondition";
import "../../css/pages/UserDashboard.css";

const UserDashboard = () => {
  const [activePage, setActivePage] = useState("dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;
      case "soundpackage":
        return <SoundPackage />;
      case "payment":
        return <PaymentHistory />;
      case "terms":
        return <TermsAndCondition />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="user-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="sidebar-title">Event Sound System</h2>
        <ul>
          <li
            className={activePage === "dashboard" ? "active" : ""}
            onClick={() => setActivePage("dashboard")}
          >
            Dashboard
          </li>
          <li
            className={activePage === "soundpackage" ? "active" : ""}
            onClick={() => setActivePage("soundpackage")}
          >
            Sound Packages
          </li>
          <li
            className={activePage === "payment" ? "active" : ""}
            onClick={() => setActivePage("payment")}
          >
            Payment History
          </li>
          <li
            className={activePage === "terms" ? "active" : ""}
            onClick={() => setActivePage("terms")}
          >
            Terms and Conditions
          </li>
        </ul>
      </aside>

      <main className="main-content">{renderPage()}</main>
    </div>
  );
};

export default UserDashboard;