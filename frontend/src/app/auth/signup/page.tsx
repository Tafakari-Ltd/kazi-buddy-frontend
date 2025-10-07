"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/Redux/Store/Store";
import { registerWorker, clearState } from "@/Redux/Features/WorkersSlice";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface IFormData {
  profile_photo?: File;
  username: string;
  phone_number: string;
  email: string;
  full_name: string;
  password: string;
  confirm_password: string;
}

const Signup: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, successMessage } = useSelector(
    (state: RootState) => state.worker
  );

  const router = useRouter();

  const [formData, setFormData] = useState<IFormData>({
    profile_photo: undefined,
    username: "",
    phone_number: "",
    email: "",
    full_name: "",
    password: "",
    confirm_password: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Toast messages
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      toast.info("Please check your email for the verification code. Don't forget to check your spam folder!", {
        duration: 6000
      });
      setFormData({
        profile_photo: undefined,
        username: "",
        phone_number: "",
        email: "",
        full_name: "",
        password: "",
        confirm_password: "",
      });
      dispatch(clearState());
    }
   
  }, [successMessage, dispatch]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    
  
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    if (name === "profile_photo" && files) {
      setFormData({ ...formData, profile_photo: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Password validation
  const validatePassword = (password: string) => {
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
    return pattern.test(password);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous field errors
    setFieldErrors({});

    // Password match check
    if (formData.password !== formData.confirm_password) {
      toast.error("Passwords do not match.");
      return;
    }

    // Password strength check
    if (!validatePassword(formData.password)) {
      toast.error(
        "Password must be at least 6 characters and include lowercase, uppercase, number, and special character."
      );
      return;
    }

    try {
      const resultAction = await dispatch(
        registerWorker({
          ...formData,
          user_type: "worker",
        })
      );

      if (registerWorker.fulfilled.match(resultAction)) {
        // Successful registration
        const userId = resultAction.payload.user_id;
        const userEmail = formData.email;
        
        // Pass email along with userId for resend functionality
        router.push(`/auth/verify-email?userId=${userId}&email=${encodeURIComponent(userEmail)}`);
      } else if (registerWorker.rejected.match(resultAction)) {
        
        console.log("=== DEBUGGING ERROR ===");
        console.log("Full resultAction:", resultAction);
        console.log("Payload type:", typeof resultAction.payload);
        console.log("Payload value:", resultAction.payload);
        
        const errorPayload = resultAction.payload;
        
        if (errorPayload && typeof errorPayload === 'object' && 'fieldErrors' in errorPayload) {
          const errors: Record<string, string> = {};
          const payloadWithErrors = errorPayload as { fieldErrors: Record<string, string[]> };
          
          Object.entries(payloadWithErrors.fieldErrors).forEach(([field, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              errors[field] = messages[0];
            }
          });
          setFieldErrors(errors);
          toast.error(`Please fix ${Object.keys(errors).length} error${Object.keys(errors).length > 1 ? 's' : ''} in the form`);
          return;
        }
        
        if (typeof errorPayload === 'string') {
          try {
            const parsedError = JSON.parse(errorPayload);
            console.log("Parsed error from string:", parsedError);
            
            if (parsedError?.fieldErrors && Object.keys(parsedError.fieldErrors).length > 0) {
              const errors: Record<string, string> = {};
              Object.entries(parsedError.fieldErrors).forEach(([field, messages]) => {
                if (Array.isArray(messages) && messages.length > 0) {
                  errors[field] = messages[0];
                }
              });
              setFieldErrors(errors);
              toast.error(`Please fix ${Object.keys(errors).length} error${Object.keys(errors).length > 1 ? 's' : ''} in the form`);
              return;
            }
          } catch (e) {
            console.log("Not valid JSON, treating as plain message");
          }
        }
        
     
        toast.error(typeof errorPayload === 'string' ? errorPayload : "Registration failed");
      }
    } catch (err: any) {
      console.error("Unexpected error:", err);
      toast.error(err?.message || "An unexpected error occurred");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-maroon via-purple-dark to-redish px-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-[600px]">
        <h2 className="text-3xl font-bold text-center text-maroon mb-6">
          Sign Up
        </h2>
        
        {/* Display field errors summary */}
        {Object.keys(fieldErrors).length > 0 && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-md shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-semibold text-red-800">
                  {Object.keys(fieldErrors).length === 1 
                    ? 'Please fix the following error:' 
                    : `Please fix the following ${Object.keys(fieldErrors).length} errors:`}
                </h3>
                <div className="mt-2 text-sm text-red-700 max-h-32 overflow-y-auto">
                  <ul className="space-y-1">
                    {Object.entries(fieldErrors).map(([field, error]) => (
                      <li key={field} className="flex items-start">
                        <span className="mr-2 text-red-500">•</span>
                        <span>
                          <strong className="capitalize">{field.replace(/_/g, ' ')}:</strong> {error}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Profile Photo */}
          <div>
            <label htmlFor="profile_photo" className="block text-sm font-medium text-gray-700 mb-1">
              Profile Photo
            </label>
            <input
              id="profile_photo"
              type="file"
              name="profile_photo"
              accept="image/*"
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2"
            />
            {formData.profile_photo && (
              <p className="text-xs text-gray-500 mt-1">
                Selected: {formData.profile_photo.name}
              </p>
            )}
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full border rounded-md px-4 py-2 ${
                fieldErrors.username ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-maroon'
              }`}
              required
            />
            {fieldErrors.username && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.username}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              id="phone_number"
              type="tel"
              name="phone_number"
              placeholder="Phone Number"
              value={formData.phone_number}
              onChange={handleChange}
              className={`w-full border rounded-md px-4 py-2 ${
                fieldErrors.phone_number ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-maroon'
              }`}
              required
            />
            {fieldErrors.phone_number && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.phone_number}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className={`w-full border rounded-md px-4 py-2 ${
                fieldErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-maroon'
              }`}
              required
            />
            {fieldErrors.email && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="full_name"
              type="text"
              name="full_name"
              placeholder="Your full name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2"
              required
              minLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">
              Must include lowercase, uppercase, number, and special character.
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirm_password"
              type="password"
              name="confirm_password"
              placeholder="Confirm Password"
              value={formData.confirm_password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2"
              required
              minLength={6}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-maroon hover:bg-redish disabled:opacity-50 text-white py-2 rounded-md font-medium transition"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          Already have an account?{" "}
          <a href="/auth/login" className="text-maroon hover:underline">
            Login here
          </a>
        </div>
      </div>
    </div>
  );
};

export default Signup;