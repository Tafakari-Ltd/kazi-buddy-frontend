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

  // Toast messages
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
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
    if (error) {
      toast.error(error);
      dispatch(clearState());
    }
  }, [successMessage, error, dispatch]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
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
        router.push(`/auth/verify-email?userId=${userId}`);
      } else if (registerWorker.rejected.match(resultAction)) {
        // Handle backend errors (like duplicates)
        console.error("Registration failed:", resultAction.payload);
        toast.error(resultAction.payload || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred");
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-maroon via-purple-dark to-redish px-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-[600px]">
        <h2 className="text-3xl font-bold text-center text-maroon mb-6">
          Sign Up
        </h2>
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
              className="w-full border border-gray-300 rounded-md px-4 py-2"
              required
            />
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
              className="w-full border border-gray-300 rounded-md px-4 py-2"
              required
            />
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
              className="w-full border border-gray-300 rounded-md px-4 py-2"
              required
            />
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
