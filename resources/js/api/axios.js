// resources/js/api/axios.js
import axios from "axios";

export default axios.create({
  baseURL: "http://localhost:8000", // your Laravel backend
  withCredentials: true, // allow sending cookies for Sanctum
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
