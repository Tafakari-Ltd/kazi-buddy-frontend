"use client";
import React from "react";
import { motion } from "framer-motion";

interface DashboardStatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: "blue" | "indigo" | "green" | "purple" | "orange" | "red";
  delay?: number;
}

const DashboardStatCard: React.FC<DashboardStatCardProps> = ({
  title,
  value,
  icon,
  color,
  delay = 0,
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700",
    indigo: "bg-indigo-50 text-indigo-700",
    green: "bg-green-50 text-green-700",
    purple: "bg-purple-50 text-purple-700",
    orange: "bg-orange-50 text-orange-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm border border-gray-200"
    >
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${colorClasses[color]}`}>
        {icon}
      </div>
    </motion.div>
  );
};

export default DashboardStatCard;