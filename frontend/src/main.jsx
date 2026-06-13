import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import axios from 'axios'
import './index.css'

// 1. The Request Interceptor: Attaches the JWT token
axios.interceptors.request.use((config) => {
  // ONLY attach the token if the request is going to our Express backend
  // This prevents AWS S3 from rejecting our presigned URL uploads!
  if (config.url.startsWith('http://localhost:8000') || config.url.startsWith('/api')) {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// 2. The Response Interceptor: Handles Expired Tokens
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the backend says "401 Unauthorized" (e.g., token expired after 12 hours)
    if (error.response && error.response.status === 401) {
      console.warn("Security token expired. Logging out.");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth'; // Boot the user back to the login screen
    }
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)