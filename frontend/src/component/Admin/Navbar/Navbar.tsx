"use client";
import React, { useState } from "react";
import {
  Menu,
  Search,
  User,
  Bell,
  Settings,
  ChevronDown,
  X,
} from "lucide-react";

import { useDispatch } from "react-redux";

import { AppDispatch } from "@/Redux/Store/Store";

import api from "@/lib/axios";

import { openSidebar } from "@/Redux/Features/AdminSIdebarSlice";

import { logout } from "@/Redux/Features/authSlice";

import { useRouter } from "next/navigation";

import { toast } from "sonner";


const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const router = useRouter()

  const handleLogout = async () => {

    const logoutUrl = "accounts/logout/";

    try {
      await api.post(logoutUrl, {});
      toast.success("You have been logged out successfully 👋");
    } catch (error: any) {
      console.error("Logout API error:", error);
      toast.error("Logout failed, clearing session locally ⚠️");
    } finally {
      dispatch(logout());
      router.push("/auth/login");
    }
  };


  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-30 h-12 bg-white border-b border-gray-200 shadow-sm px-4">
        {/* Left Section */}

        <div className="container h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              aria-label="Toggle menu"
              onClick={() => {
                dispatch(openSidebar());
              }}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Menu className="text-gray-700 w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 select-none">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-700 to-blue-800 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-semibold">A</span>
              </div>
              <h1 className="text-lg font-semibold text-gray-900 tracking-tight">
                Administration
              </h1>
            </div>
          </div>

          {/* Center - Search (visible lg+) */}
          <div className="relative w-72 hidden lg:block">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <input
              type="search"
              aria-label="Search users, reports, and settings"
              placeholder="Search users, reports, settings..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-300 bg-gray-50 text-sm placeholder-gray-400
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Right Section */}
          <nav className="flex items-center gap-1" aria-label="User navigation">
            {/* Mobile Search Button */}
            <button
              aria-label="Toggle search"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden"
            >
              <Search className="text-gray-700 w-4 h-4" />
            </button>

            {/* Notifications */}
            <button
              aria-label="View notifications"
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Bell className="text-gray-700 w-4 h-4" />
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-red-600 text-white text-xs font-semibold leading-none select-none">
                3
              </span>
            </button>

            {/* Settings */}
            <button
              aria-label="Settings"
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Settings className="text-gray-700 w-4 h-4" />
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-gray-300 mx-2" aria-hidden="true" />

            {/* User Profile */}
            <div className="flex items-center gap-2">
              <div className="hidden md:flex flex-col items-end select-none">
                <span className="text-xs font-semibold text-gray-900 leading-none">
                  Admin User
                </span>
                <span className="text-[9px] text-gray-500">ID: YUQWRYWEQTEW</span>
              </div>

              <button
                aria-haspopup="true"
                aria-expanded="false"
                tabIndex={0}
                className="flex items-center gap-1 p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center">
                  <User className="text-white w-3.5 h-3.5" />
                </div>
                <ChevronDown className="text-gray-500 w-3.5 h-3.5 hidden sm:block" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 ml-2">
              <button
                type="button"
                className="px-2 py-1 text-xs font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Home
              </button>
              <button
                onClick={handleLogout}
                type="button"
                className="px-2 py-1 text-xs font-semibold text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                Logout
              </button>
            </div>
          </nav>
        </div>

      </header>

      {/* Mobile Sidebar Menu */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Menu</h2>
          <nav className="flex flex-col gap-3">
            <a
              href="#"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Dashboard
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Users
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Reports
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Settings
            </a>
          </nav>
        </div>
      </div>

      {/* Overlay for Mobile Sidebar */}
      {mobileMenuOpen && (
        <button
          aria-label="Close menu"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-30 z-30"
        />
      )}

      {/* Mobile Search Overlay */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-white p-4 flex items-center shadow-lg">
          <Search className="text-gray-400 w-5 h-5 mr-3" />
          <input
            type="search"
            aria-label="Mobile search"
            placeholder="Search users, reports, settings..."
            autoFocus
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            aria-label="Close search"
            onClick={() => setMobileSearchOpen(false)}
            className="ml-3 p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <X className="text-gray-700 w-5 h-5" />
          </button>
        </div>
      )}
    </>
  );
};

export default Navbar;
