"use client";

import React, { useState } from "react";
import { categories } from "@/component/Homepage/HotJobs/Jobs";
import CustomDialCodeSelect from "@/data/phone_codes/CustomSelect";

interface FormData {
  username: string;
  email: string;
  fullName: string;
  password: string;
  confirmPassword: string;
  role: "worker" | "employee";
  profession: string;
  phone: string;
  dial_code: string;
}

const Signup: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    fullName: "",
    password: "",
    confirmPassword: "",
    role: "worker",
    profession: "",
    phone: "",
    dial_code: "+1", // default dial code
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!formData.profession && formData.role === "worker") {
      setError("Please select a profession");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Replace this with your actual API endpoint
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Signup failed");
        setLoading(false);
        return;
      }

      // Signup successful, reset form or redirect user
      alert("Signup successful!");
      setFormData({
        username: "",
        email: "",
        fullName: "",
        password: "",
        confirmPassword: "",
        role: "worker",
        profession: "",
        phone: "",
        dial_code: "+1",
      });
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-maroon via-purple-dark to-redish px-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-[800px]">
        <h2 className="text-3xl font-bold text-center text-maroon mb-6">
          Sign Up
        </h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            {/* Username and Email */}
            <div className="flex flex-col sm:flex-row sm:space-x-4">
              <div className="w-full">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  placeholder="Username"
                  className="w-full border border-gray-300 rounded-md px-4 py-2"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="w-full mt-4 sm:mt-0">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  className="w-full border border-gray-300 rounded-md px-4 py-2"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Phone with Dial Code */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number
              </label>
              <div className="flex">
                <CustomDialCodeSelect
                  value={formData.dial_code}
                  onChange={(dial_code) =>
                    setFormData({ ...formData, dial_code })
                  }
                />

                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  className="flex-1 border-l-0 border border-gray-300  px-4 py-2"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                placeholder="Your full name"
                className="w-full border border-gray-300 rounded-md px-4 py-2"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password and Confirm Password */}
            <div className="flex flex-col sm:flex-row sm:space-x-4">
              <div className="w-full">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="w-full border border-gray-300 rounded-md px-4 py-2"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>

              <div className="w-full mt-4 sm:mt-0">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  className="w-full border border-gray-300 rounded-md px-4 py-2"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
                {error && (
                  <p className="text-red-500 text-sm mt-1" role="alert">
                    {error}
                  </p>
                )}
              </div>
            </div>

            {/* Role */}
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Select Role
              </label>
              <select
                id="role"
                name="role"
                className="w-full border border-gray-300 rounded-md px-4 py-2"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="worker">WORKER</option>
                <option value="employee">EMPLOYEE</option>
              </select>
            </div>

            {/* Profession */}
            <div>
              <label
                htmlFor="profession"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Profession
              </label>
              <select
                id="profession"
                name="profession"
                className="w-full border border-gray-300 rounded-md px-4 py-2"
                value={formData.profession}
                onChange={handleChange}
                required={formData.role === "worker"}
                disabled={formData.role !== "worker"}
              >
                <option value="">Select a profession</option>
                {categories?.map((category: string, index: number) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full bg-maroon hover:bg-redish disabled:opacity-50 text-white py-2 rounded-md font-medium transition"
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
