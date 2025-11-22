import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message;
    console.error("API Error:", message);
    
    // Network error handling
    if (!error.response) {
      console.error("Network Error: Cannot connect to backend at", API_BASE_URL);
      console.error("Please ensure your FastAPI backend is running!");
    }
    
    return Promise.reject(error);
  }
);
