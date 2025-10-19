"use client";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface NavItem {
  label: string;
  href?: string;
  submenu?: {
    label: string;
    href: string;
  }[];
}

export const navItems: NavItem[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Jobs",
    href: "/jobs",
  },
  {
    label: "Workers",
    href: "/workers",
  },
  {
    label: "Candidates",
    submenu: [
      { label: "Browse Jobs", href: "/jobs" },
      { label: "Manage applications", href: "/jobs/users/applications/" },
      { label: "Jobs Alert", href: "/jobs/users/alerts" },
    ],
  },
];

const DesktopNav: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <nav className="hidden md:flex items-center justify-between px-10 py-4">
      <ul className="flex space-x-8 text-sm font-medium text-purple-800">
        {navItems.map((item, index) => (
          <li
            key={index}
            className="relative"
            onMouseEnter={() => item.submenu && setActiveIndex(index)}
            onMouseLeave={() => item.submenu && setActiveIndex(null)}
          >
            {item.submenu ? (
              <>
                <div
                  className="flex items-center cursor-pointer hover:text-rose-600 transition duration-150"
                  role="button"
                  aria-haspopup="true"
                  aria-expanded={activeIndex === index}
                >
                  <span className="mr-1">{item.label}</span>
                  <ChevronDown className="w-4 h-4" />
                </div>
                <AnimatePresence>
                  {activeIndex === index && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 top-full mt-2 min-w-[180px] rounded-md bg-white border border-gray-200 shadow-lg z-50"
                    >
                      <ul>
                        {item.submenu.map((subItem, subIndex) => (
                          <li key={subIndex}>
                            <Link
                              href={subItem.href}
                              className="block px-4 py-2 text-sm text-purple-800 hover:bg-rose-600 hover:text-white transition duration-150"
                            >
                              {subItem.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <Link
                href={item.href || "/"}
                className="hover:text-rose-600 transition duration-150"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default DesktopNav;
