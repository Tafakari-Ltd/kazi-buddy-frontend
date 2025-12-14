"use client";
import React from "react";

interface WorkerTabsProps {
  activeTab: string;
  setTab: (tab: string) => void;
  options: string[];
}

const WorkerTabs: React.FC<WorkerTabsProps> = ({ activeTab, setTab, options }) => {
  return (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 container">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => setTab(option)}
          className={`whitespace-nowrap px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === option
              ? "bg-red-800 text-white shadow-md"
              : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default WorkerTabs;