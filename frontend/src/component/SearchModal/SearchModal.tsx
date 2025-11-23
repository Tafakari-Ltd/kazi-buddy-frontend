"use client";
import React, { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";

import { toggleSearch } from "@/Redux/Features/SearchSlice";

import { AppDispatch } from "@/Redux/Store/Store";

import { useDispatch } from "react-redux";

const jobList = [
  "Cleaning & House Help",
  "Driving & Delivery",
  "Construction Work",
  "Shop Attendant",
  "Farm Work",
  "Cooking & Kitchen Help",
  "Security Guard",
  "Laundry & Dry Cleaning",
];

// Throttle function
const throttle = (func: (...args: any[]) => void, delay: number) => {
  let lastCall = 0;
  return (...args: any[]) => {
    const now = new Date().getTime();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

const SearchModal = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredJobs, setFilteredJobs] = useState<string[]>(jobList);

  const throttledSearch = useMemo(
    () =>
      throttle((term: string) => {
        const results = jobList.filter((job) =>
          job.toLowerCase().includes(term.toLowerCase()),
        );
        setFilteredJobs(results);
      }, 500), // 500ms throttle delay
    [],
  );

  useEffect(() => {
    throttledSearch(searchTerm);
  }, [searchTerm, throttledSearch]);

  const dispatch = useDispatch<AppDispatch>();

  const onClose = () => {
    dispatch(toggleSearch());
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center pt-20 px-4 sm:px-0">
      <div className="bg-white w-full max-w-7xl rounded shadow-lg relative z-50">
        {/* Close Button */}
        <div className="flex justify-end p-4">
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-red-600 transition"
            aria-label="Close search modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Header */}
        <div className="px-6 pb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Search Jobs
          </h2>
          <input
            type="text"
            placeholder="e.g. plumber, writer, designer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        {/* Search Results */}
        <div className="px-6 pb-6 max-h-72 overflow-y-auto">
          {filteredJobs.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {filteredJobs.map((job, idx) => (
                <li
                  key={idx}
                  className="bg-gray-100 p-3 rounded hover:bg-gray-200 transition cursor-pointer"
                >
                  {job}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No jobs found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
