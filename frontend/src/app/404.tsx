"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function NotFound() {
  useEffect(() => {
    document.title = "404 | Page Not Found";
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 px-4">
      <h1 className="text-6xl font-bold text-[#800000] mb-4">404</h1>
      <p className="text-xl text-gray-700 mb-6">
        Oops! The page you’re looking for doesn’t exist.
      </p>
      <Link
        href="/"
        className="bg-[#800000] text-white px-6 py-2 rounded hover:bg-red-700 transition"
      >
        Go Back Home
      </Link>
      <div className="mt-10">
        <img
          src="/404-illustration.svg"
          alt="Not found"
          className="w-80 h-auto"
        />
      </div>
    </div>
  );
}
