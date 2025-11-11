import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import Welcome from "./Pages/Welcome";
import Userdashboard from "./Pages/Userdashboard";
import Admindashboard from "./Pages/Admindashboard"; // ✅ Import admin dashboard
import PasswordReset from "./Pages/PasswordReset";

axios.defaults.withCredentials = true;
// Use same-origin by default so axios calls match the host the app is served from.
axios.defaults.baseURL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Global axios interceptor to handle 401 Unauthorized centrally
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // If the 401 came from the login endpoint, don't force a redirect —
          // allow the login component to handle the error and display messages so the
          // user can correct credentials without the UI closing unexpectedly.
          const reqUrl = (error.config && error.config.url) ? error.config.url.toString() : '';
          if (reqUrl.includes('/api/login')) {
            return Promise.reject(error);
          }

          // clear local token and axios header to prevent repeated 401s
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          // redirect to root (login) - full reload so server state is reset
          window.location.href = '/';
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        await axios.get("/sanctum/csrf-cookie");

        const token = localStorage.getItem("token");
        if (token) {
          // set default Authorization header so all axios requests include the token
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          const response = await axios.get("/api/user");
          setUser(response.data);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("User not authenticated:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // also listen for direct login events to update user immediately
    const onAuthLogin = (e) => {
      if (e?.detail) setUser(e.detail);
    };
    window.addEventListener('auth:login', onAuthLogin);

    return () => {
      window.removeEventListener('auth:login', onAuthLogin);
    };
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<Welcome />} />

        {/* Protected route for user */}
        <Route
          path="/userdashboard/*"
          element={
            user && user.role === "user" ? (
              <Userdashboard user={user} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Protected route for admin */}
        <Route
          path="/admindashboard/*"
          element={
            user && user.role === "admin" ? (
              <Admindashboard user={user} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Catch-all route */}
        <Route path="/password-reset/:token" element={<PasswordReset />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

ReactDOM.createRoot(document.getElementById("app")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
