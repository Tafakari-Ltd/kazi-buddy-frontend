"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import { Search, Briefcase, MapPin, Layers, ChevronDown, Users, Star } from "lucide-react";
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

  const HERO_IMAGE_URL = "/hero.jpg";

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

  
  useEffect(() => {
    const counts: Record<string, number> = {};
    
    if (jobs && jobs.length > 0) {
      jobs.forEach((job: any) => {
        let categoryId = "";

        if (job.category && typeof job.category === 'object' && job.category.id) {
            categoryId = job.category.id;
        } 

        else if (typeof job.category === 'string') {
          
            const matchById = categories.find(cat => cat.id === job.category);
            
            if (matchById) {
                categoryId = matchById.id;
            } else {
                
                const matchByName = categories.find(
                    cat => cat.name.toLowerCase() === job.category.toLowerCase()
                );
                if (matchByName) {
                    categoryId = matchByName.id;
                }
            }
        }

        if (categoryId) {
          counts[categoryId] = (counts[categoryId] || 0) + 1;
        }
      });
    }
    setCategoryJobCounts(counts);
  }, [jobs, categories]);

  
  const handleSearch = () => {
  
    const filters: any = {
      page: 1,
      limit: 12,
      status: 'active' 
    };

    if (searchQuery.trim()) {
      filters.search_query = searchQuery.trim();
    }

  
    if (locationQuery.trim()) {
      filters.location = locationQuery.trim();
    }

  
    if (selectedCategory && selectedCategory !== "All categories") {
  
      const category = categories.find(cat => cat.name === selectedCategory);
      if (category) {
        filters.category = category.id;
      }
    }

  
    if (selectedJobType) {
      filters.job_type = selectedJobType;
    }

  
    dispatch(setFilters(filters));

    const searchTerms = [];
    if (searchQuery) searchTerms.push(`"${searchQuery}"`);
    if (locationQuery) searchTerms.push(`in ${locationQuery}`);
    if (selectedCategory !== "All categories") searchTerms.push(`(${selectedCategory})`);
    
    if (searchTerms.length > 0) {
      toast.success(`Searching for ${searchTerms.join(' ')}`);
    }

    scrollToJobs();
  };

  const handleQuickCategorySearch = (category: any) => {
    setSelectedCategory(category.name);
    
    
    const filters: any = {
      page: 1,
      limit: 12,
      status: 'active',
      category: category.id 
    };

    if (searchQuery.trim()) filters.search_query = searchQuery.trim();
    if (locationQuery.trim()) filters.location = locationQuery.trim();
    if (selectedJobType) filters.job_type = selectedJobType;

    dispatch(setFilters(filters));
    
    toast.success(`Showing ${category.name} jobs`);
    scrollToJobs();
  };

  const scrollToJobs = () => {
    const jobsSection = document.getElementById('jobs-section');
    if (jobsSection) {
      jobsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
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
    <div className="relative w-full">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${HERO_IMAGE_URL}')` }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-maroon/90 via-purple-dark/80 to-redish/90"></div>
      </div>

      {/* Content Wrapper */}
      <div className="relative z-10">
        <Navbar />
        <div className="text-white py-16 pb-24 px-6 md:px-12 relative flex flex-col items-center justify-start md:justify-center container" style={{ minHeight: '100vh' }}>
          <div className="max-w-6xl mx-auto text-center space-y-6">
            
            {/* Social Proof / Trust Badge */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-2 mb-2"
            >
              <div className="flex -space-x-3">
                {[1,2,3,4].map((i) => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-maroon bg-gray-300 overflow-hidden flex items-center justify-center text-xs text-black font-bold bg-white`}>
                    <Users className="w-4 h-4 text-gray-500" />
                  </div>
                ))}
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-white border border-white/10 flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                Trusted by 2,000+ locals
              </div>
            </motion.div>

            <h3 className="text-4xl md:text-5xl font-extrabold leading-tight drop-shadow-lg">
              Find the job that fits your life
            </h3>
            <p className="text-lg md:text-xl text-purple-100 drop-shadow-md">
              Over <span className="font-semibold text-white">12,000</span> jobs
              are waiting to kickstart your career!
            </p>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-4 items-center bg-white p-4 rounded-lg shadow-2xl text-gray-700">
              {/* Job Title / Keywords Input */}
              <div className="flex items-center gap-2 border border-neutral-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-purple-600">
                <Briefcase className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Job title / keywords"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full outline-none bg-transparent"
                />
              </div>

              {/* Location Input */}
              <div className="flex items-center gap-2 border border-neutral-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-purple-600">
                <MapPin className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="City / location"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full outline-none bg-transparent"
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
                className="flex justify-center items-center gap-2 bg-[#800000] hover:bg-[#a00000] text-white px-4 py-2 rounded-md transition-all font-medium disabled:opacity-50 shadow-md"
              >
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>

            {/* Available Categories Info */}
            {Object.keys(categoryJobCounts).length > 0 && (
              <div className="mt-8 bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 shadow-lg">
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
                        
                        onClick={() => handleQuickCategorySearch(cat)}
                        className="text-xs bg-white/90 hover:bg-white text-[#800000] px-3 py-1.5 rounded-full font-medium transition flex items-center gap-1 shadow-sm"
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
              <p className="text-sm font-semibold uppercase mb-2 drop-shadow-sm">
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
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition backdrop-blur-sm ${
                      selectedJobType === type.value
                        ? "bg-white text-[#800000] shadow-md"
                        : "bg-white/20 text-white hover:bg-white/30 border border-white/10"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Keywords */}
            <div className="mt-6 text-purple-100">
              <p className="text-sm font-semibold uppercase mb-2 drop-shadow-sm">
                Popular Keywords
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {["Plumbing", "TV Installation", "Cleaning", "Watchmen"].map(
                  (keyword, index) => (
                    <button
                      key={index}
                      onClick={() => handleKeywordClick(keyword)}
                      className="px-4 py-1.5 bg-white text-[#800000] rounded-full text-sm font-medium hover:bg-purple-200 transition shadow-sm"
                    >
                      {keyword}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Animated Scroll Indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
            onClick={scrollToJobs}
          >
            <span className="text-xs text-purple-100 font-medium tracking-widest uppercase opacity-80">Scroll Down</span>
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2 bg-black/10 backdrop-blur-sm"
            >
              <motion.div className="w-1 h-2 bg-white rounded-full" />
            </motion.div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Hero;