"use client";

import React from "react";
import Link from "next/link";
import {
  X,
  Home,
  PlusSquare,
  Briefcase,
  FileText,
  FileCheck,
  Users,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";

import { RootState } from "@/Redux/Store/Store";
import { closeSidebar, toggleSidebar } from "@/Redux/Features/SidebarSlice";

import "./sidebar.css";

const Sidebar = () => {
  const dispatch = useDispatch();
  const pathname = usePathname();

  const { open, type } = useSelector((state: RootState) => state.sidebar);

  // Nav links for admin vs employee
  const adminLinks = [
    {
      href: "/employer",
      label: "Manage Applications",
      icon: FileText,
    },
    { href: "/employer/manage/jobs", label: "Manage Jobs", icon: Briefcase },

    { href: "/", label: "Home", icon: Home },
    { 
      href: "/workers", 
      label: "Find Workers", 
      icon: Users 
    },
  ];

  const employersLinks = [
    { href: "/employers", label: "My Applications", icon: FileText },
  ];

  const navLinks = type !== "admin" ? adminLinks : employersLinks;

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => dispatch(closeSidebar())}
        />
      )}

      {/* Sidebar */}
      <div
        className={`sidebar fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Sidebar navigation"
      >
        <div className="flex items-center justify-between px-6 py-[0.88rem] border-b border-gray-200">
          <Link
            href="/"
            className="text-2xl font-extrabold text-maroon select-none"
          >
            Kazi<span className="text-gray-800">Buddy</span>
          </Link>
          <button
            onClick={() => dispatch(closeSidebar())}
            aria-label="Close sidebar"
            className="p-1 rounded hover:bg-gray-200 transition"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="mt-6 px-4" role="navigation">
          <ul className="space-y-3">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-2 py-2 px-4 rounded transition ${
                      isActive
                        ? "bg-maroon text-white font-semibold"
                        : "text-gray-700 hover:bg-maroon hover:text-white"
                    }`}
                    onClick={() => dispatch(closeSidebar())}
                  >
                    <Icon size={18} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
