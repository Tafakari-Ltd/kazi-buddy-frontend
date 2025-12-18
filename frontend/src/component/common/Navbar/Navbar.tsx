"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, User, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

import DesktopNav from "../DesktopNav/DesktopNav";
import MobileNav from "../MobileNav/MobileNav";

import { AppDispatch, RootState } from "@/Redux/Store/Store";
import { setQuery } from "@/Redux/Features/SearchSlice";
import { logout, loadSession } from "@/Redux/Features/authSlice";

import api from "@/lib/axios";
import { toast } from "sonner";

const Navbar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const authState = useSelector((state: RootState) => state.auth);
  const isAuthenticated = authState.isAuthenticated;
  const user = authState.user;

  const isAdmin =
    user?.is_staff ||
    user?.is_superuser ||
    user?.role === "admin" ||
    user?.user_type === "admin";

  // ✅ Load session on mount
  useEffect(() => {
    dispatch(loadSession());
  }, [dispatch]);

  const toggleProfileMenu = () => setIsProfileOpen((prev) => !prev);

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

  return (
    <header className="w-full bg-white shadow-md fixed top-0 z-30">
      <div className="mx-auto h-[55px] px-4 md:px-6 flex items-center justify-between relative container">
        {/* Logo */}
        <Link href="/" className="text-2xl font-extrabold text-maroon">
          Kazi<span className="text-gray-800">Buddy</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 justify-center">
          <DesktopNav />
        </nav>

        {/* Search Input */}
        <div className="hidden lg:block w-64">
          <input
            type="text"
            placeholder="Search job"
            onChange={(e) => dispatch(setQuery(e.target.value))}
            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-redish"
          />
        </div>

        {/* CTA Buttons (Desktop) */}
        <div className="hidden md:flex items-center space-x-3 ml-4">
          {isAuthenticated && (
            <Link href="/messages">
              <button className="apply-button">Messages</button>
            </Link>
          )}
          <Link href="/employer?postjob=1">
            <button className="bg-[#800000] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#600000] transition-colors whitespace-nowrap">
              Post Job
            </button>
          </Link>

          {/* Show login/logout depending on session */}
          {isAuthenticated ? (
            <button className="apply-button" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <>
              <Link href="/auth/signup">
                <button className="apply-button">Sign Up</button>
              </Link>
              <Link href="/auth/login">
                <button className="apply-button">Login</button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center space-x-3 ml-4">
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-md text-purple-800 hover:text-redish focus:outline-none"
              aria-label="Open mobile menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Profile Dropdown (only if logged in) */}
          {isAuthenticated && (
            <div className="relative">
              <button
                onClick={toggleProfileMenu}
                aria-haspopup="true"
                aria-expanded={isProfileOpen}
                className="flex items-center justify-between w-[60px] p-1 border border-neutral-300 rounded-sm text-purple-800 hover:text-redish focus:outline-none"
              >
                <User className="w-5 h-5" />
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${
                    isProfileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-[64px] w-44 bg-white border border-gray-200 rounded-md shadow-md z-50"
                  >
                    <ul className="flex flex-col text-sm text-gray-700">
                      {(() => {
                        const items = [
                          { label: "Profile", href: "/profile" },
                          { label: "Messages", href: "/messages" },
                          {
                            label: "Account Settings",
                            href: "/account-settings",
                          },
                          { label: "Worker Dashboard", href: "/worker" },
                          { label: "Employer", href: "/employer" },
                        ];

                        if (isAdmin) {
                          items.push({ label: "Admin Panel", href: "/admin" });
                        }

                        return items;
                      })().map(({ label, href }) => (
                        <li key={label}>
                          <Link
                            href={href}
                            onClick={() => setIsProfileOpen(false)}
                            className="block px-4 py-2 hover:bg-redish hover:text-white"
                          >
                            {label}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 hover:bg-redish hover:text-white"
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
    </header>
  );
};

export default Navbar;
