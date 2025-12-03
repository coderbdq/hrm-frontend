// src/api/client.js
import axios from "axios";

const API_BASE_URL = " https://zona-unbrandied-uneagerly.ngrok-free.dev"; // backend Spring Boot của bạn

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Gắn token vào mọi request nếu có
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
