"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/Redux/Features/authSlice";

import { AppDispatch, RootState } from "@/Redux/Store/Store";

const LoginPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  const { loading, error } = useSelector((state: RootState) => state.auth);
  const [formError, setFormError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await dispatch(login({ email, password })).unwrap();
      const returnTo = searchParams.get("returnTo");
      router.push(returnTo || "/employer");
    } catch (err: any) {
      setFormError(err || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-maroon via-purple-dark to-redish px-6">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <h2 className="text-3xl font-bold text-center text-maroon mb-6">
          KaziBuddy
        </h2>

        {/* Google Sign In */}
        <button
          className="w-full flex items-center justify-center gap-3 bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-200 transition mb-6"
          onClick={() => { }}
          disabled={loading}
        >
          <FcGoogle size={24} />
          Continue with Google
        </button>

        <div className="text-center text-sm text-gray-400 mb-4">— OR —</div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-maroon"
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Enter your password"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-maroon"
              disabled={loading}
            />
          </div>

          {(formError || error) && (
            <p className="text-red-600 text-sm mb-4 text-center">
              {formError || error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-maroon hover:bg-redish text-white py-2 rounded-md font-medium transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-maroon hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
