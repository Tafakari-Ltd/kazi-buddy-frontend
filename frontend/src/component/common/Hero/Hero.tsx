"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import { Search, Briefcase, MapPin, Layers, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/Redux/Store/Store";
import { fetchCategories } from "@/Redux/Features/jobs/jobsCategories/jobCategories";
import { setFilters } from "@/Redux/Features/jobsSlice";
import { toast } from "sonner";

const Hero = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedJobType, setSelectedJobType] = useState<string | null>(null);
  const [categoryJobCounts, setCategoryJobCounts] = useState<Record<string, number>>({});

  const dispatch = useDispatch<AppDispatch>();
  const { categories, loading, error } = useSelector(
    (state: RootState) => state.categories
  );
  const { jobs } = useSelector((state: RootState) => state.jobs);

  // Fetch categories on mount
  useEffect(() => {
    if (categories.length === 0 && !loading) {
      dispatch(fetchCategories());
    }
  }, []);

  // Calculate job counts per category whenever jobs change
  useEffect(() => {
    const counts: Record<string, number> = {};
    jobs.forEach((job: any) => {
      const categoryId = typeof job.category === 'string' ? job.category : job.category?.id;
      if (categoryId) {
        counts[categoryId] = (counts[categoryId] || 0) + 1;
      }
    });
    setCategoryJobCounts(counts);
  }, [jobs]);

  const handleSearch = () => {
    // Build search filters
    const filters: any = {
      page: 1,
      limit: 12,
      status: 'approved'
    };

    // Add search query if provided
    if (searchQuery.trim()) {
      filters.search_query = searchQuery.trim();
    }

    // Add location if provided
    if (locationQuery.trim()) {
      filters.location = locationQuery.trim();
    }

    // Add category if not "All categories"
    if (selectedCategory && selectedCategory !== "All categories") {
      // Find the category ID from the categories list
      const category = categories.find(cat => cat.name === selectedCategory);
      if (category) {
        filters.category = category.id;
      }
    }

    // Add job type if selected
    if (selectedJobType) {
      filters.job_type = selectedJobType;
    }

    // Dispatch filters to Redux
    dispatch(setFilters(filters));

    // Show search feedback
    const searchTerms = [];
    if (searchQuery) searchTerms.push(`"${searchQuery}"`);
    if (locationQuery) searchTerms.push(`in ${locationQuery}`);
    if (selectedCategory !== "All categories") searchTerms.push(`(${selectedCategory})`);
    if (selectedJobType) {
      const jobTypeLabel = selectedJobType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      searchTerms.push(`[${jobTypeLabel}]`);
    }
    
    if (searchTerms.length > 0) {
      toast.success(`Searching for ${searchTerms.join(' ')}`);
    }

    // Scroll to jobs section
    const jobsSection = document.getElementById('jobs-section');
    if (jobsSection) {
      jobsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // If no specific section, scroll down
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setDropdownOpen(false);
  };

  const handleKeywordClick = (keyword: string) => {
    setSelectedCategory(keyword);
    setSearchQuery(keyword);
  };

  return (
    <div className="relative bg-gradient-to-br from-maroon via-purple-dark to-redish">
      <Navbar />
      <div className="text-white py-16 pb-24 px-6 md:px-12 relative flex flex-col items-center justify-start md:justify-center container" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h3 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Find the job that fits your life
          </h3>
          <p className="text-lg md:text-xl text-purple-100">
            Over <span className="font-semibold text-white">12,000</span> jobs
            are waiting to kickstart your career!
          </p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-4 items-center bg-white p-4 rounded-lg shadow-lg text-gray-700">
            {/* Job Title / Keywords Input */}
            <div className="flex items-center gap-2 border border-neutral-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-purple-600">
              <Briefcase className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Job title / keywords / company"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full outline-none"
              />
            </div>

            {/* Location Input */}
            <div className="flex items-center gap-2 border border-neutral-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-purple-600">
              <MapPin className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="City / province / zip code"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full outline-none"
              />
            </div>

            {/* Categories Dropdown */}
            <div className="relative" title="Click to see job categories with job counts">
              <div
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex justify-between items-center gap-2 border border-neutral-300 rounded-md px-3 py-2 cursor-pointer hover:border-purple-600 focus-within:ring-2 focus-within:ring-purple-600 transition"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Layers className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{selectedCategory}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.ul
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-10 mt-1 bottom-auto top-full bg-white shadow-lg rounded-md w-full text-left max-h-60 overflow-y-auto border border-gray-200"
                  >
                    {loading && (
                      <li className="px-4 py-2 text-gray-500 text-center">
                        Loading categories...
                      </li>
                    )}
                    {error && (
                      <li className="px-4 py-2 text-red-500 text-sm">
                        Error: {error}
                      </li>
                    )}
                    {!loading && categories.length === 0 && !error && (
                      <li className="px-4 py-2 text-gray-500 text-center">
                        No categories available
                      </li>
                    )}

                    {!loading && (
                      <>
                        <li
                          onClick={() => handleCategorySelect("All categories")}
                          className={`px-4 py-2 cursor-pointer transition ${
                            selectedCategory === "All categories"
                              ? "bg-[#800000] text-white font-medium"
                              : "hover:bg-gray-100 text-gray-800"
                          }`}
                        >
                          All categories
                        </li>
                        {categories.map((cat) => {
                          const jobCount = categoryJobCounts[cat.id] || 0;
                          const hasJobs = jobCount > 0;
                          
                          return (
                            <li
                              key={cat.id}
                              onClick={() => handleCategorySelect(cat.name)}
                              className={`px-4 py-2 cursor-pointer transition flex items-center justify-between group ${
                                selectedCategory === cat.name
                                  ? "bg-[#800000] text-white font-medium"
                                  : hasJobs 
                                    ? "hover:bg-gray-100 text-gray-800"
                                    : "hover:bg-gray-50 text-gray-400"
                              }`}
                            >
                              <span className={!hasJobs ? "opacity-60" : ""}>{cat.name}</span>
                              {hasJobs ? (
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                  selectedCategory === cat.name
                                    ? "bg-white/20 text-white"
                                    : "bg-green-100 text-green-700 group-hover:bg-green-200"
                                }`}>
                                  {jobCount} {jobCount === 1 ? 'job' : 'jobs'}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400 italic">No jobs</span>
                              )}
                            </li>
                          );
                        })}
                      </>
                    )}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              type="button"
              className="flex justify-center items-center gap-2 bg-[#800000] hover:bg-[#a00000] text-white px-4 py-2 rounded-md transition-all font-medium disabled:opacity-50"
            >
              <Search className="w-5 h-5" />
              Search
            </button>
          </div>

          {/* Available Categories Info */}
          {Object.keys(categoryJobCounts).length > 0 && (
            <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Available Job Categories:
              </p>
              <div className="flex flex-wrap gap-2">
                {categories
                  .filter(cat => (categoryJobCounts[cat.id] || 0) > 0)
                  .map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.name);
                        handleSearch();
                      }}
                      className="text-xs bg-white/90 hover:bg-white text-[#800000] px-3 py-1.5 rounded-full font-medium transition flex items-center gap-1"
                    >
                      {cat.name}
                      <span className="bg-[#800000] text-white px-1.5 rounded-full text-xs">
                        {categoryJobCounts[cat.id]}
                      </span>
                    </button>
                  ))}
              </div>
              <p className="text-xs text-purple-200 mt-2 italic">
                💡 Click a category above to find jobs quickly
              </p>
            </div>
          )}

          {/* Job Type Quick Filters */}
          <div className="mt-6 text-purple-100">
            <p className="text-sm font-semibold uppercase mb-2">
              Job Type
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { label: "Full Time", value: "full_time" },
                { label: "Part Time", value: "part_time" },
                { label: "Contract", value: "contract" },
                { label: "Freelance", value: "freelance" },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedJobType(selectedJobType === type.value ? null : type.value)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                    selectedJobType === type.value
                      ? "bg-white text-[#800000] shadow-md"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Popular Keywords */}
          <div className="mt-6 text-purple-100">
            <p className="text-sm font-semibold uppercase mb-2">
              Popular Keywords
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Plumbing", "TV Installation", "Cleaning", "Watchmen"].map(
                (keyword, index) => (
                  <button
                    key={index}
                    onClick={() => handleKeywordClick(keyword)}
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