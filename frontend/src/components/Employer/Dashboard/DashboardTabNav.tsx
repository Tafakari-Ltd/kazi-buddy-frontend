import React from "react";

interface DashboardTabNavProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DashboardTabNav: React.FC<DashboardTabNavProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-6 py-2.5 rounded-t-lg font-medium text-sm transition-all relative whitespace-nowrap ${
            activeTab === tab
              ? "text-[#800000] bg-white border-x border-t border-gray-200 -mb-[1px] z-10"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
          }`}
        >
          {tab}
          {activeTab === tab && (
            <div className="absolute top-0 left-0 w-full h-0.5 bg-[#800000] rounded-t-lg"></div>
          )}
        </button>
      ))}
    </div>
  );
};

export default DashboardTabNav;
