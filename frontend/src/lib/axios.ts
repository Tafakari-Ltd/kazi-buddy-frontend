// src/lib/axios.ts
import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL
});

// API Base URL configured

// List of routes that are public and don't require authentication
const PUBLIC_ROUTES = [
    '/auth/login',
    '/auth/signup',
    '/auth/verify-email',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/', // homepage
    '/jobs', // public job listings
    '/about',
    '/contact',
];

// Check if current route is public
const isPublicRoute = () => {
    if (typeof window === "undefined") return true;
    
    const currentPath = window.location.pathname;
    return PUBLIC_ROUTES.some(route => 
        currentPath === route || currentPath.startsWith(route)
    );
};

api.interceptors.request.use(
    (config) => {
        const token = typeof window !== "undefined" ? sessionStorage.getItem("accessToken") : null;
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
            console.error("API error:", {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
                url: error.config?.url,
                method: error.config?.method,
                headers: error.config?.headers,
                requestData: error.config?.data,
            });
            console.error("Full API Error Response:", error.response);
            console.error("API Request Config:", error.config);
            console.error("Full error object:", error);
            
            if (error.response.status === 401) {
                if (typeof window !== "undefined") {
                    if (!isPublicRoute() && !window.location.pathname.includes('/auth/login')) {
                        console.warn("Unauthorized access detected, redirecting to login");
                        sessionStorage.clear();
                        
                        const currentPath = window.location.pathname;
                        if (currentPath !== '/auth/login') {
                            sessionStorage.setItem('redirectAfterLogin', currentPath);
                        }
                        
                        window.location.href = "/auth/login";
                    }
                }
            }
            const errorData = error.response.data;
            let errorMessage = "An error occurred";
            let fieldErrors: Record<string, string[]> = {};
            
            if (typeof errorData === 'string') {
                errorMessage = errorData;
            } else if (errorData?.stack && typeof errorData.stack === 'object') {
               
                fieldErrors = errorData.stack;
                
                
                const errorMessages: string[] = [];
                Object.entries(fieldErrors).forEach(([field, errors]) => {
                    if (Array.isArray(errors) && errors.length > 0) {
                       
                        const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        errorMessages.push(`${fieldName}: ${errors[0]}`);
                    }
                });
                
                errorMessage = errorMessages.length > 0 
                    ? errorMessages.join('\n') 
                    : errorData.message || "Operation failed";
                    
            } else if (errorData?.message) {
                errorMessage = errorData.message;
            } else if (errorData?.detail) {
                errorMessage = errorData.detail;
            } else if (errorData?.error) {
                errorMessage = errorData.error;
            } else if (errorData?.non_field_errors) {
                errorMessage = Array.isArray(errorData.non_field_errors) 
                    ? errorData.non_field_errors[0] 
                    : errorData.non_field_errors;
            } else {
                // Handle standard field-specific errors (like email already exists)
                const firstKey = Object.keys(errorData)[0];
                if (firstKey && errorData[firstKey]) {
                    const fieldError = errorData[firstKey];
                    errorMessage = Array.isArray(fieldError) ? fieldError[0] : fieldError;
                    fieldErrors[firstKey] = Array.isArray(fieldError) ? fieldError : [fieldError];
                }
            }
            
            return Promise.reject({
                message: errorMessage,
                status: error.response.status,
                data: errorData,
                fieldErrors: fieldErrors 
            });
        } else if (error.request) {
            console.error("No response from server:", error.request);
            return Promise.reject({ 
                message: "No response from server. Please check your connection.",
                status: 0,
                data: null
            });
        } else {
            console.error("Error setting up request:", error.message);
            return Promise.reject({ 
                message: error.message || "Failed to make request",
                status: 0,
                data: null
            });
        }
    }
);

export default api;