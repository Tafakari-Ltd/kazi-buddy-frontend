"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/Redux/Store/Store";
import { registerUser, clearAuthState } from "@/Redux/Features/authSlice";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/component/Authentication/AuthLayout";
import { FormField } from "@/component/Authentication/FormField";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface IFormData {
  profile_photo?: File;
  username: string;
  phone_number: string;
  email: string;
  full_name: string;
  password: string;
  confirm_password: string;
}

const WorkerSignup: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  

  const { loading, error, successMessage } = useSelector(
    (state: RootState) => state.auth
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
      toast.info(
        "Please check your email for the verification code. Don't forget to check your spam folder!",
        { duration: 6000 }
      );
      setFormData({
        profile_photo: undefined,
        username: "",
        phone_number: "",
        email: "",
        full_name: "",
        password: "",
        confirm_password: "",
      });
      
      dispatch(clearAuthState());
    }
  }, [successMessage, dispatch]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
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

  const validatePassword = (password: string) => {
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
    return pattern.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    if (formData.password !== formData.confirm_password) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!validatePassword(formData.password)) {
      toast.error(
        "Password must be at least 6 characters and include lowercase, uppercase, number, and special character."
      );
      return;
    }

    try {
      
      const resultAction = await dispatch(
        registerUser({
          ...formData,
          user_type: "worker",
        })
      );

      if (registerUser.fulfilled.match(resultAction)) {
        const userId = resultAction.payload.user_id;
        const userEmail = formData.email;

        router.push(
          `/auth/verify-email?userId=${userId}&email=${encodeURIComponent(userEmail)}`
        );
      } else if (registerUser.rejected.match(resultAction)) {
        const errorPayload = resultAction.payload;

        if (
          errorPayload &&
          typeof errorPayload === "string" &&
          errorPayload.includes("fieldErrors")
        ) {
          try {
            const parsedError = JSON.parse(errorPayload);
            if (parsedError?.fieldErrors) {
              const errors: Record<string, string> = {};
              Object.entries(parsedError.fieldErrors).forEach(
                ([field, messages]: [string, any]) => {
                  if (Array.isArray(messages) && messages.length > 0) {
                    errors[field] = messages[0];
                  } else if (typeof messages === 'string') {
                    errors[field] = messages;
                  }
                }
              );
              
              if (Object.keys(errors).length > 0) {
                setFieldErrors(errors);
                
                // Check for specific email error
                if (errors.email) {
                  toast.error(errors.email);
                } else if (Object.keys(errors).includes('email')) {
                   toast.error("This email address is already registered.");
                } else {
                  toast.error(
                    `Please fix ${Object.keys(errors).length} error${Object.keys(errors).length > 1 ? "s" : ""} in the form`
                  );
                }
                return;
              }
            }
          } catch (e) {
          
          }
        }
        
        // Handle non-field specific errors
        if (typeof errorPayload === 'string') {
           if (errorPayload.toLowerCase().includes("email already exists") || errorPayload.toLowerCase().includes("user with this email already exists")) {
             toast.error("This email address is already registered. Please use a different email or login.");
             setFieldErrors(prev => ({...prev, email: "This email is already in use"}));
           } else {
             toast.error(errorPayload || "Registration failed");
           }
        } else {
           toast.error("Registration failed. Please try again.");
        }
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred.");
    }
  };

   const heroContent = (
    <>
      <h1 className="text-5xl font-bold mb-6 leading-tight">
        Start Your Job Search Journey
      </h1>
      <p className="text-lg text-gray-100 mb-8">
        Create your profile and get access to thousands of job opportunities across Kenya.
      </p>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Build Your Profile</h3>
            <p className="text-gray-200 text-sm">
              Showcase your skills and experience
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Apply with Ease</h3>
            <p className="text-gray-200 text-sm">
              One-click applications to multiple jobs
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Track Applications</h3>
            <p className="text-gray-200 text-sm">
              Monitor your job applications in one place
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <AuthLayout heroContent={heroContent}>
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl w-full">
        <Link
          href="/auth/signup"
          className="inline-flex items-center text-sm text-gray-600 hover:text-maroon mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to account type
        </Link>

        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Sign Up as Worker
        </h2>
        <p className="text-gray-600 mb-6">
          Let's get started, complete these easy steps
        </p>

        {/* Display field errors summary */}
        {Object.keys(fieldErrors).length > 0 && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-red-800">
                  Please fix the following errors:
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc pl-5 space-y-1">
                    {Object.entries(fieldErrors).map(([field, error]) => (
                      <li key={field}>
                        <strong className="capitalize">
                          {field.replace(/_/g, " ")}:
                        </strong>{" "}
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Full Name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />

            <FormField
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              error={fieldErrors.username}
              required
            />

            <FormField
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              error={fieldErrors.email}
              helpText="This email will need to be verified in the next step"
              required
            />

            <FormField
              label="Phone Number"
              name="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="+254 700 000000"
              error={fieldErrors.phone_number}
              required
            />

            <FormField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              helpText="Must include uppercase, lowercase, number, and special character"
              minLength={6}
              required
            />

            <FormField
              label="Confirm Password"
              name="confirm_password"
              type="password"
              value={formData.confirm_password}
              onChange={handleChange}
              placeholder="Re-enter your password"
              minLength={6}
              required
            />

            <FormField
              label="Profile Photo (Optional)"
              name="profile_photo"
              type="file"
              accept="image/*"
              onChange={handleChange}
              file={formData.profile_photo}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-maroon hover:bg-redish disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors mt-6"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-maroon font-semibold hover:underline"
          >
            Log in here
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default WorkerSignup;
