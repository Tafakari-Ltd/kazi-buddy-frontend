"use client";
import React from "react";
import { Users, UploadCloud, Briefcase, Settings } from "lucide-react";

interface EmployerTabsProps {
  activeTab: string;
  setTab: (tab: string) => void;
  options: string[];
}

const EmployerTabs: React.FC<EmployerTabsProps> = ({ activeTab, setTab, options }) => {
  
  const getIcon = (option: string) => {
    switch (option) {
      case "Employees Offered Jobs": return <Users className="w-4 h-4" />;
      case "Upload Job": return <UploadCloud className="w-4 h-4" />;
      case "Job Applications": return <Briefcase className="w-4 h-4" />;
      case "Profile Setup": return <Settings className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="flex gap-3 mb-6 flex-wrap container overflow-x-auto pb-2">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => setTab(option)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
            activeTab === option
              ? "bg-red-800 text-white shadow-md transform scale-105"
              : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200"
          }`}
        >
          {getIcon(option)}
          {option}
        </button>
      ))}
    </div>
  );
};

export default EmployerTabs;