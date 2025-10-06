import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import Welcome from "./Pages/Welcome";
import UserDashboard from "./Pages/Userdashboard";
import { auth } from "../firebase"; // make sure firebase.js exports `auth`
import { onAuthStateChanged } from "firebase/auth";

function App() {
  const [user, setUser] = useState(null);

  // Listen for authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe(); // cleanup
  }, []);

  return <>{user ? <UserDashboard /> : <Welcome />}</>;
}

ReactDOM.createRoot(document.getElementById("app")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

