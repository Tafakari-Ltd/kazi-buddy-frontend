"use client";
import React from "react";
import { Briefcase, CheckCircle, Eye, Star } from "lucide-react";

const WorkerStatsCards: React.FC = () => {
  // In a real app, these would be props. Using placeholders as per original code.
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 container">
      <StatCard
        icon={<Briefcase className="w-6 h-6" />}
        label="Total Jobs Applied"
        value="--"
        color="blue"
      />
      <StatCard
        icon={<CheckCircle className="w-6 h-6" />}
        label="Applications Accepted"
        value="--"
        color="green"
      />
      <StatCard
        icon={<Eye className="w-6 h-6" />}
        label="Profile Views"
        value="--"
        color="purple"
      />
      <StatCard
        icon={<Star className="w-6 h-6" />}
        label="My Rating"
        value="--"
        color="amber"
      />
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) => {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium">{label}</p>
        <h4 className="text-2xl font-bold text-gray-800">{value}</h4>
      </div>
    </div>
  );
};

export default WorkerStatsCards;