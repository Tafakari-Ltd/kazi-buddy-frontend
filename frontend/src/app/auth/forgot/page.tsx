"use client";

import React, { useState, FormEvent } from "react";
import { AuthLayout } from "@/component/Authentication/AuthLayout";
import Link from "next/link";
import { ShieldCheck, Mail, ArrowRight } from "lucide-react";

const Forgot: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(`Reset password link sent to: ${email}`);
    setSubmitted(true);
  };

  const heroContent = (
    <>
      <h1 className="text-5xl font-bold mb-6 leading-tight">
        Account Recovery
      </h1>
      <p className="text-lg text-gray-100 mb-8">
        Don't worry, it happens. We'll help you get back on track in no time.
      </p>
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Check Your Email</h3>
            <p className="text-gray-200 text-sm">
              We'll send a secure link to your inbox
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Secure Reset</h3>
            <p className="text-gray-200 text-sm">
              Create a new, strong password
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <ArrowRight className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Back to Work</h3>
            <p className="text-gray-200 text-sm">
              Regain access to your dashboard instantly
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <AuthLayout heroContent={heroContent}>
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Forgot Password?
        </h2>
        
        {submitted ? (
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Check your mail</h3>
            <p className="text-gray-600 mb-6">
              We have sent a password recover instructions to your email <strong>{email}</strong>.
            </p>
            <button 
              onClick={() => setSubmitted(false)}
              className="text-maroon font-medium hover:underline text-sm"
            >
              Did not receive the email? Check spam or try again
            </button>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-8">
              Enter the email address associated with your account and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-maroon transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-maroon hover:bg-redish text-white py-3 rounded-lg font-semibold transition"
              >
                Send Reset Link
              </button>
            </form>
          </>
        )}

        <div className="mt-8 text-center border-t pt-6">
          <Link href="/auth/login" className="text-sm font-semibold text-gray-600 hover:text-maroon flex items-center justify-center gap-2 transition">
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to Login
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Forgot;