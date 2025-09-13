"use client";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { openSidebar } from "@/Redux/Features/SIdebarSlice";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const dispatch = useDispatch();
  const { open, type } = useSelector((state: RootState) => state.sidebar);

  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <div className="h-16 w-full bg-white border-b border-gray-200 px-6  fixed top-0 left-0 right-0 z-50 shadow-sm">
      {/* Left Section */}
      <div className="container flex items-center justify-between h-full">
        <div className="flex items-center gap-6">
          <button
            onClick={() => dispatch(openSidebar())}
            className="p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            aria-label="Toggle sidebar"
          >
            <Menu className="text-gray-600 w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-red-800 to-red-900 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">EM</span>
            </div>
            <h1 className="text-sm font-semibold text-gray-900 tracking-tight">
              Employers portal
            </h1>
          </div>
        </div>

        {/* Center - Search (Desktop) */}
        <div className="hidden lg:flex relative w-80">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search employees, departments, positions..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-sm"
            />
          </div>
        </div>

        {/* Right Section - Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {/* Search for tablet */}
          <button className="p-2.5 rounded-lg hover:bg-gray-50 transition-colors duration-200 lg:hidden">
            <Search className="text-gray-600 w-4 h-4" />
          </button>

          {/* Notifications */}
          <button className="relative p-2.5 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <Bell className="text-gray-600 w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          {/* Settings */}
          <button className="p-2.5 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <Settings className="text-gray-600 w-4 h-4" />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 mx-2"></div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="hidden lg:flex flex-col items-end">

                  <span className="text-xs text-gray-500">ID: 654782193</span>
                </div>

                <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center">
                  <User className="text-white w-4 h-4" />
                </div>

                <ChevronDown
                  className={`text-gray-500 w-4 h-4 transition-transform duration-200 ${userDropdownOpen ? "rotate-180" : "rotate-0"
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

                    <p className="text-xs text-gray-500">ID: 654782193</p>
                  </div>

                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                    <Home className="w-4 h-4" />
                    Dashboard
                  </button>

                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                    <User className="w-4 h-4" />
                    Profile Settings
                  </button>

                  <div className="border-t border-gray-100 mt-1">
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200">
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden relative">
          <button
            onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
            className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-6 bg-gradient-to-br from-gray-600 to-gray-700 rounded flex items-center justify-center">
              <User className="text-white w-3 h-3" />
            </div>
            <ChevronDown
              className={`text-gray-500 w-4 h-4 transition-transform duration-200 ${mobileDropdownOpen ? "rotate-180" : "rotate-0"
                }`}
            />
          </button>

          <AnimatePresence>
            {mobileDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 space-y-4 origin-top-right"
              >
                {/* Mobile Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center">
                    <User className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">ID: 654782193</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                    <Home className="w-4 h-4" />
                    Dashboard
                  </button>

                  <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                    <Bell className="w-4 h-4" />
                    Notifications
                  </button>

                  <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>

                  <div className="border-t border-gray-200 pt-2">
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200">
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
