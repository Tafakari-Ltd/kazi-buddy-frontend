"use client";

import React, { useState, FormEvent } from "react";

const Forgot: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(`Reset password link sent to: ${email}`);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-maroon via-purple-dark to-redish px-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-maroon mb-6">
          Forgot Password
        </h2>
        {submitted ? (
          <div className="text-center text-green-600">
            A password reset link has been sent to <strong>{email}</strong>.
          </div>
        ) : (
          <>
            <p className="text-center text-gray-600 text-sm mb-6">
              Enter your registered email address and we’ll send you a link to
              reset your password.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-maroon"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-maroon hover:bg-redish text-white py-2 rounded-md font-medium transition"
              >
                Send Reset Link
              </button>
            </form>
          </>
        )}

        <div className="mt-6 text-center">
          <a href="/auth/login" className="text-sm text-maroon hover:underline">
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default Forgot;
