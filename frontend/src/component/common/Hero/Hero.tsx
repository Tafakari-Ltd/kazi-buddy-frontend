"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import { Search, Briefcase, MapPin, Layers, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/Redux/Store/Store";

import { fetchCategories } from "@/Redux/Features";

const Hero = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All categories");

  const dispatch = useDispatch<AppDispatch>();
  const { categories, loading, error } = useSelector(
    (state: RootState) => state.categories
  );

  // Fetch categories on mount if not already in store/sessionStorage
  useEffect(() => {
    if (!categories.length) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length]);

  return (
    <div className="relative bg-gradient-to-br from-maroon via-purple-dark to-redish">
      <Navbar />
      <div className="text-white pb-24 px-6 md:px-12 relative flex flex-col items-center justify-center h-screen container">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h3 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Find the job that fits your life
          </h3>
          <p className="text-lg md:text-xl text-purple-100">
            Over <span className="font-semibold text-white">12,000</span> jobs
            are waiting to kickstart your career!
          </p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-4 items-center bg-white p-4 rounded-lg shadow-lg text-gray-700">
            <div className="flex items-center gap-2 border border-neutral-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-purple-600">
              <Briefcase className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Job title / keywords / company"
                className="w-full outline-none"
              />
            </div>

            <div className="flex items-center gap-2 border border-neutral-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-purple-600">
              <MapPin className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="City / province / zip code"
                className="w-full outline-none"
              />
            </div>

            {/* Categories Dropdown */}
            <div className="relative">
              <div
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex justify-between items-center gap-2 border border-neutral-300 rounded-md px-3 py-2 cursor-pointer focus-within:ring-2 focus-within:ring-purple-600"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-gray-400" />
                  <span>{selectedCategory}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.ul
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute z-10 mb-1 bottom-full bg-white shadow-md rounded-md w-full text-left max-h-60 overflow-y-auto"
                  >
                    {loading && (
                      <li className="px-4 py-2 text-gray-500">Loading...</li>
                    )}
                    {error && (
                      <li className="px-4 py-2 text-red-500">{error}</li>
                    )}
                    <li
                      onClick={() => {
                        setSelectedCategory("All categories");
                        setDropdownOpen(false);
                      }}
                      className="px-4 py-2 hover:bg-redish text-gray-800 hover:text-white cursor-pointer"
                    >
                      All categories
                    </li>
                    {categories.map((cat) => (
                      <li
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.name);
                          setDropdownOpen(false);
                        }}
                        className="px-4 py-2 hover:bg-redish text-gray-800 hover:text-white cursor-pointer"
                      >
                        {cat.name}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            <button
              type="submit"
              className="flex justify-center items-center gap-2 bg-[#800000] hover:bg-[#a00000] text-white px-4 py-2 rounded-md transition-all"
            >
              <Search className="w-5 h-5" />
              Search
            </button>
          </div>

          <div className="mt-6 text-purple-100">
            <p className="text-sm font-semibold uppercase mb-2">
              Popular Keywords
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Plumbing", "TV Installation", "Cleaning", "Watchmen"].map(
                (keyword, index) => (
                  <button
                    key={index}
                    className="px-4 py-1.5 bg-white text-[#800000] rounded-full text-sm font-medium hover:bg-purple-200 transition"
                  >
                    {keyword}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        <button className="absolute bg-maroon hover:bg-redish text-white px-6 py-2 left-0 top-[50%] -translate-y-1/2 rounded-r-md shadow-md">
          ALL PAGES
        </button>
      </div>
    </div>
  );
};

export default Hero;
