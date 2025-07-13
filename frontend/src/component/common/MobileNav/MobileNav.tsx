"use client";

import Link from "next/link";
import { ChevronDown, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export const navItems = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Candidates",
    submenu: [
      { label: "Browse Jobs", href: "/jobs" },
      { label: "Manage applications", href: "/jobs/users/applications/" },
      { label: "Jobs Alert", href: "/jobs/users/alerts" },
    ],
  },
  {
    label: "Employers",
    submenu: [
      { label: "Add Job", href: "/add-job" },
      { label: "Manage Job", href: "/manage-jobs" },
      { label: "Manage Application", href: "/manage-applications" },
      { label: "Manage Resumes", href: "/employer-resumes" },
    ],
  },
];

interface NavItem {
  label: string;
  href?: string;
  submenu?: {
    label: string;
    href: string;
  }[];
}

interface MobileNavProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ isOpen, setIsOpen }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Slide-in Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-xl overflow-y-auto"
          >
            {/* Header */}
            <div className="flex justify-end p-4 border-b border-gray-200 h-[65px]">
              <button
                onClick={() => setIsOpen(false)}
                className="text-purple-800 hover:text-rose-600 transition cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation Items */}
            <ul className="space-y-2 px-4 pb-10 text-purple-800 font-medium">
              {navItems.map((item: NavItem, index: number) => (
                <li key={index}>
                  {item.submenu && item.submenu.length > 0 ? (
                    <>
                      <button
                        onClick={() =>
                          setActiveIndex(activeIndex === index ? null : index)
                        }
                        className="flex items-center justify-between w-full py-3 text-left hover:text-rose-600 transition"
                        aria-expanded={activeIndex === index}
                        aria-controls={`submenu-${index}`}
                      >
                        <span>{item.label}</span>
                        <ChevronDown
                          className={`w-4 h-4 transform transition-transform ${
                            activeIndex === index ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      <AnimatePresence>
                        {activeIndex === index && (
                          <motion.ul
                            id={`submenu-${index}`}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="pl-4 bg-maroon text-white border border-purple-200 rounded-md overflow-hidden"
                          >
                            {item.submenu.map((subItem, subIndex) => (
                              <li key={subIndex}>
                                <Link
                                  href={subItem.href}
                                  className="block py-2 px-2 text-sm hover:text-rose-300 transition"
                                  onClick={() => setIsOpen(false)}
                                >
                                  {subItem.label}
                                </Link>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      href={item.href || "#"}
                      className="block w-full py-3 hover:text-rose-600 transition"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            {/* Bottom Actions */}
            <div className="px-4 pb-8 space-y-4">
              <Link
                href="/post-job"
                className="block"
                style={{
                  marginBottom: "0.5rem",
                }}
              >
                <button className="apply-button">POST JOB</button>
              </Link>
              <Link href="/auth/login">
                <button className="apply-button">LOGIN</button>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileNav;
