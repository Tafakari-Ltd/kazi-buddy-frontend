import axios from "axios";
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL
});
api.interceptors.request.use(
    (config) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        if (error.response) {
            console.error("API error:", error.response.data);
            if (error.response.status === 401) {

                if (typeof window !== "undefined") {
                    return;
                }
            }
        } else if (error.request) {
            console.error("No response from server:", error.request);
        } else {
            console.error("Error setting up request:", error.message);
        }
        return Promise.reject(error);
    }
);
export default api;