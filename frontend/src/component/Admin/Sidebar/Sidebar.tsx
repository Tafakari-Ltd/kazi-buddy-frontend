"use client";
import React, { useState } from "react";
import {
  X,
  ChevronDown,
  Building2,
  Settings,
  BarChart3,
  FileText,
  Calendar,
  UserCheck,
} from "lucide-react";

import { RootState, AppDispatch } from "@/Redux/Store/Store";
import { useSelector, useDispatch } from "react-redux";
import { closeSidebar } from "@/Redux/Features/AdminSIdebarSlice";

import { menuItems } from "../AdminSIdebarComponents";

import { motion, AnimatePresence } from "framer-motion";

const sidebarVariants = {
  hidden: { x: "-100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
  exit: { x: "-100%", opacity: 0, transition: { ease: "easeInOut" as const } },
} as const;

const Sidebar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const open = useSelector((state: RootState) => state.adminSidebar.open);

  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const quickActions = [
    { label: "Analytics", icon: BarChart3, href: "/analytics" },
    { label: "Reports", icon: FileText, href: "/reports" },
    { label: "Schedule", icon: Calendar, href: "/schedule" },
    { label: "Approvals", icon: UserCheck, href: "/approvals", badge: "3" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="h-screen w-72 bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-40 shadow-sm"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={sidebarVariants}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-red-800 to-red-900 rounded-lg flex items-center justify-center">
                  <Building2 className="text-white w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    Workspace
                  </h2>
                  <p className="text-xs text-gray-500">Management Portal</p>
                </div>
              </div>
              <button
                onClick={() => dispatch(closeSidebar())}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                aria-label="Close sidebar"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isExpanded = expandedSections[item.id];
                const hasSubmenu = item.submenu && item.submenu.length > 0;

                return (
                  <div key={item.id} className="space-y-1">
                    {/* Main Item */}
                    <div
                      onClick={() => hasSubmenu && toggleSection(item.id)}
                      className={`
                        flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200
                        hover:bg-gray-50 group
                        ${
                          item.id === "dashboard"
                            ? "bg-red-50 text-red-700 border border-red-100"
                            : "text-gray-700"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-5 h-5 ${
                            item.id === "dashboard"
                              ? "text-red-600"
                              : "text-gray-500 group-hover:text-red-600"
                          }`}
                        />
                        <span className="font-medium text-sm">
                          {item.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.badge && (
                          <span
                            className={`
                            px-2 py-0.5 text-xs font-medium rounded-full
                            ${
                              item.id === "dashboard"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700 group-hover:bg-red-100 group-hover:text-red-700"
                            }
                          `}
                          >
                            {item.badge}
                          </span>
                        )}
                        {hasSubmenu && (
                          <ChevronDown
                            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </div>
                    </div>

                    {/* Submenu */}
                    {hasSubmenu && isExpanded && (
                      <div className="ml-8 space-y-1 pb-2">
                        {item.submenu.map((subItem, index) => (
                          <a
                            key={index}
                            href={subItem.href}
                            className="block px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50 hover:text-red-600 transition-colors duration-200"
                          >
                            {subItem.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Quick Actions */}
            <div className="mt-8 px-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                Quick Actions
              </h3>
              <div className="space-y-1">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <a
                      key={index}
                      href={action.href}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                        <span className="text-sm font-medium">
                          {action.label}
                        </span>
                      </div>
                      {action.badge && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                          {action.badge}
                        </span>
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100">
            <a
              href="/settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors duration-200 group"
            >
              <Settings className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
              <span className="text-sm font-medium">Settings</span>
            </a>

            <div className="mt-3 px-3">
              <div className="text-xs text-gray-400">
                <p>Version 2.1.0</p>
                <p>© 2025 Company Name</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
