"use client";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { openSidebar } from "@/Redux/Features/SidebarSlice";
import { RootState } from "@/Redux/Store/Store";
import {
  Menu,
  Search,
  ChevronDown,
  User,
  Bell,
  Settings,
  LogOut,
  Home,
  Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AppDispatch } from "@/Redux/Store/Store";
import api from "@/lib/axios";
import { toast } from "sonner";
import { logout } from "@/Redux/Features/authSlice";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const user = useSelector((state: RootState) => state.auth.user);

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post("accounts/logout/", {});
      toast.success("You have been logged out successfully 👋");
    } catch (error: any) {
      console.error("Logout API error:", error);
      toast.error("Logout failed, clearing session locally ⚠️");
    } finally {
      dispatch(logout());
      router.push("/auth/login");
    }
  };

  // Get user ID from auth state
  const userId = useSelector((state: RootState) => state.auth.userId) || user?.user_id;
  const displayId = userId ? userId.slice(0, 8) : "N/A";

  return (
    <div className="h-16 w-full bg-white border-b border-gray-200 px-6 fixed top-0 left-0 right-0 z-50 shadow-sm">
      <div className="container flex items-center justify-between h-full mx-auto">
        {/* Left Section */}
        <div className="flex items-center gap-6">

          <button
            onClick={() => dispatch(openSidebar())}
            className="p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="text-gray-600 w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            {/* Worker Badge - Blue Theme */}
            <div className="w-8 h-8 bg-gradient-to-br from-blue-800 to-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">WK</span>
            </div>
            <h1 className="text-sm font-semibold text-gray-900 tracking-tight">
              Worker portal
            </h1>
          </div>
        </div>

        {/* Center - Search */}
        <div className="hidden lg:flex relative w-96">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search jobs, skills, or applications..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1">
          {/* Notifications */}
          <button className="relative p-2.5 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <Bell className="text-gray-600 w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          {/* Settings */}
          <button className="p-2.5 rounded-lg hover:bg-gray-50 transition-colors duration-200 hidden md:block">
            <Settings className="text-gray-600 w-4 h-4" />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 mx-2 hidden md:block"></div>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="hidden lg:flex flex-col items-end">
                  {/* Truncated ID with hover tooltip */}
                  <span
                    className="text-xs text-gray-500 cursor-pointer"
                    title={userId}
                  >
                    ID: {displayId}
                  </span>
                  <span className="text-sm font-medium text-gray-800">
                    {user?.full_name || "Worker"}
                  </span>
                </div>

                <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                  {user?.profile_photo_url ? (
                    <img 
                      src={user.profile_photo_url} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="text-white w-4 h-4" />
                  )}
                </div>

                <ChevronDown
                  className={`text-gray-500 w-4 h-4 transition-transform duration-200 ${
                    userDropdownOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </div>
            </button>

            <AnimatePresence>
              {userDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2 origin-top-right"
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800">{user?.full_name}</p>
                    <p className="text-xs text-gray-500" title={userId}>
                      ID: {displayId}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>

                  <button 
                    onClick={() => router.push('/worker')}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Home className="w-4 h-4" />
                    Dashboard
                  </button>

                  <button 
                    onClick={() => router.push('/worker')}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Briefcase className="w-4 h-4" />
                    My Jobs
                  </button>

                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                    <User className="w-4 h-4" />
                    Profile Settings
                  </button>

                  <div className="border-t border-gray-100 mt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;