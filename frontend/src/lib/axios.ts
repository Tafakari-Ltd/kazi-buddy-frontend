import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" ? sessionStorage.getItem("accessToken") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      // Handle Unauthorized
      if (status === 401 && typeof window !== "undefined") {
        if (!window.location.pathname.startsWith("/auth")) {
          sessionStorage.clear();
          document.cookie = "accessToken=; path=/; max-age=0"; 
          window.location.href = `/auth/login?returnTo=${window.location.pathname}`;
        }
      }

      let errorMessage = "An error occurred";
      let fieldErrors: Record<string, string[]> = {};

      if (typeof data === "string") {
        errorMessage = data;
      } else if (data?.detail) {
        errorMessage = data.detail;
      } else if (data?.message) {
        errorMessage = data.message;
      } else if (data?.error) {
        errorMessage = data.error;
      } else if (data?.non_field_errors) {
        errorMessage = Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors;
      } else {
        // Handle field errors
        Object.entries(data).forEach(([key, val]) => {
          fieldErrors[key] = Array.isArray(val) ? val.map(String) : [String(val)];
        });
        const firstKey = Object.keys(fieldErrors)[0];
        if (firstKey) errorMessage = fieldErrors[firstKey][0];
      }

      return Promise.reject({
        message: errorMessage,
        status,
        data,
        fieldErrors,
      });
    }
    
    return Promise.reject({
      message: error.message || "Network Error",
      status: 0,
      data: null,
    });
  }
);

export default api;